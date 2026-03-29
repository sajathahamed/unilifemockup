import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import {
  extractTextFromPdfBuffer,
  parseTimetableFromText,
  validateParsedSlots,
  type TimetableEntryType,
} from '@/lib/student-timetable-parse.server'

export const runtime = 'nodejs'

const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

/**
 * POST /api/student/timetable/upload (multipart: file)
 * Multipart: `file`, optional `timetableType` = `class` | `exam` (which schedule this upload replaces).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Missing file' }, { status: 400 })
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ message: 'File too large (max 12MB)' }, { status: 400 })
    }

    const mime = file.type || 'application/octet-stream'
    if (!ALLOWED.has(mime)) {
      return NextResponse.json({ message: 'Use PDF, JPG, PNG, or WebP' }, { status: 400 })
    }

    const client = await createClient()
    
    // Create a service role client to bypass RLS for storage upload
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const timetableTypeRaw = form.get('timetableType') ?? form.get('entryType')
    const timetableType: TimetableEntryType =
      String(timetableTypeRaw || 'class').toLowerCase() === 'exam' ? 'exam' : 'class'

    const buf = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120)
    const path = `${user.id}/${Date.now()}-${safeName}`

    const { data: uploadRow, error: insErr } = await client
      .from('timetable_uploads')
      .insert({
        user_id: user.id,
        file_path: path,
        mime_type: mime,
        status: 'processing',
      })
      .select('id')
      .single()

    if (insErr || !uploadRow) {
      console.error('timetable_uploads insert:', insErr)
      return NextResponse.json({ message: 'Could not create upload record' }, { status: 500 })
    }

    const uploadId = uploadRow.id as number

    // Use adminClient here to bypass RLS policies
    const { error: upErr } = await adminClient.storage.from('timetable-uploads').upload(path, buf, {
      contentType: mime,
      upsert: true,
    })

    if (upErr) {
      await client.from('timetable_uploads').update({ status: 'failed', parse_note: upErr.message }).eq('id', uploadId)
      return NextResponse.json(
        {
          message:
            'Storage upload failed. Create a private bucket named timetable-uploads in Supabase and try again.',
          detail: upErr.message,
        },
        { status: 500 }
      )
    }

    try {
      const parsed = (await (async () => {
        if (mime === 'application/pdf') {
          const text = await extractTextFromPdfBuffer(buf)
          if (text) {
            const p = validateParsedSlots(parseTimetableFromText(text, timetableType))
            if (p.length > 0) return p
          }
        }
        const { parseTimetableWithAI } = await import('@/lib/student-timetable-parse.server')
        return await parseTimetableWithAI(buf, mime, timetableType)
      })()) || []

      // Replace only the timetable kind the student chose (weekly classes vs exams stay independent).
      if (parsed.length > 0) {
        await client
          .from('student_timetable_entries')
          .delete()
          .eq('user_id', user.id)
          .eq('entry_type', timetableType)

        const rows = parsed.map((p) => ({
          user_id: user.id,
          upload_id: uploadId,
          day_of_week: p.day_of_week,
          start_time: p.start_time,
          end_time: p.end_time,
          subject: p.subject,
          location: p.location || null,
          entry_type: timetableType,
          exam_date: null,
        }))

        const { error: e2 } = await client.from('student_timetable_entries').insert(rows)
        if (e2) {
          await client.from('timetable_uploads').update({ status: 'failed', parse_note: e2.message }).eq('id', uploadId)
          return NextResponse.json({ message: e2.message }, { status: 400 })
        }
      }

      const parseNote =
        parsed.length === 0
          ? `No ${timetableType === 'exam' ? 'exam ' : ''}timetable lines detected. Try a clearer photo or a text-based PDF.`
          : ''

      await client
        .from('timetable_uploads')
        .update({
          status: parsed.length > 0 ? 'parsed' : 'stored',
          file_url: null,
          parse_note: parseNote,
        })
        .eq('id', uploadId)

      // Schedule reminders
      const { refreshUserReminders } = await import('@/lib/student-timetable-reminders.server')
      await refreshUserReminders(user.id, client)

      return NextResponse.json(
        {
          ok: true,
          uploadId,
          timetableType,
          slotsImported: parsed.length,
          parseNote: parseNote || (parsed.length === 0 ? 'No automatic slots; add manually.' : null),
        },
        { status: 200 }
      )
    } catch (parseError: any) {
      console.error('Core parsing failed:', parseError)
      await client.from('timetable_uploads').update({ status: 'failed', parse_note: parseError.message }).eq('id', uploadId)
      return NextResponse.json({ message: `Parsing error: ${parseError.message}`, detail: parseError.stack }, { status: 500 })
    }
  } catch (error) {
    console.error('timetable upload:', error)
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { detail } : {}),
      },
      { status: 500 }
    )
  }
}
