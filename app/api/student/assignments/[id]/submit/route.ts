import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const SUBMISSION_BUCKET = 'assignment-submissions'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

/**
 * POST /api/student/assignments/[id]/submit
 * Submit or update own submission. Accepts JSON (content only) or multipart/form-data (content + optional file).
 * File: PDF, DOC, DOCX only. Max 10MB.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (Number.isNaN(assignmentId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    let content: string | null = null
    let fileUrl: string | null = null
    let fileName: string | null = null

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const contentPart = formData.get('content')
      content = contentPart != null ? String(contentPart).trim() || null : null
      const file = formData.get('file') as File | null
      if (file && file.size > 0) {
        const type = file.type?.toLowerCase() || ''
        if (!ALLOWED_TYPES.includes(type)) {
          return NextResponse.json(
            { message: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' },
            { status: 400 }
          )
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { message: 'File too large. Maximum size is 10MB.' },
            { status: 400 }
          )
        }
        const admin = getSupabaseAdmin()
        if (!admin) {
          return NextResponse.json(
            {
              message:
                'File upload needs SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (Supabase Dashboard → Project Settings → API → service_role key), then restart the dev server.',
            },
            { status: 503 }
          )
        }
        const ext = type.includes('pdf') ? 'pdf' : type.includes('openxml') ? 'docx' : 'doc'
        const safeName = sanitizeFileName(file.name) || `submission.${ext}`
        const path = `${assignmentId}/${user.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await admin.storage
          .from(SUBMISSION_BUCKET)
          .upload(path, await file.arrayBuffer(), {
            contentType: file.type,
            upsert: true,
          })
        if (uploadError) {
          console.error('Submission file upload error:', uploadError)
          return NextResponse.json(
            { message: uploadError.message || 'Failed to upload file. Ensure the storage bucket exists.' },
            { status: 400 }
          )
        }
        const { data: urlData } = admin.storage.from(SUBMISSION_BUCKET).getPublicUrl(path)
        fileUrl = urlData?.publicUrl ?? null
        fileName = file.name
      }
    } else {
      const body = await request.json().catch(() => ({}))
      content = body.content != null ? String(body.content).trim() || null : null
    }

    const client = await createClient()

    const { data: existing } = await client
      .from('assignment_submissions')
      .select('id, file_url')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .single()

    const payload: {
      content: string | null
      submitted_at: string
      file_url?: string | null
      file_name?: string | null
    } = {
      content: content ?? null,
      submitted_at: new Date().toISOString(),
    }
    // Only set file fields when we actually uploaded a new file (don't clear existing file when updating only content)
    if (fileUrl != null) {
      payload.file_url = fileUrl
      payload.file_name = fileName ?? null
    }

    if (existing) {
      const { data, error } = await client
        .from('assignment_submissions')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) {
        console.error('Submission update error:', error)
        return NextResponse.json({ message: error.message || 'Failed to update' }, { status: 400 })
      }
      return NextResponse.json(data, { status: 200 })
    }

    const { data, error } = await client
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        content: payload.content ?? null,
        status: 'submitted',
        submitted_at: payload.submitted_at,
        file_url: payload.file_url ?? null,
        file_name: payload.file_name ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Submission create error:', error)
      return NextResponse.json({ message: error.message || 'Failed to submit' }, { status: 400 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Submit error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
