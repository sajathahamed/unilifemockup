import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { parseTimetableEntryInput, validateExamDateNotPast } from '@/lib/student-timetable-entry.shared'

/**
 * POST /api/student/timetable/entries
 * - { append: true, entry: { ... } } → insert one row
 * - { entries: [...] } → replace all rows with list (legacy)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const client = await createClient()
    const { refreshUserReminders } = await import('@/lib/student-timetable-reminders.server')

    if (body && body.append === true && body.entry && typeof body.entry === 'object') {
      const parsed = parseTimetableEntryInput(body.entry as Record<string, unknown>)
      if (!parsed) {
        return NextResponse.json(
          {
            message:
              'Invalid entry: need day_of_week, start_time, end_time (HH:MM), subject.',
          },
          { status: 400 }
        )
      }
      const pastErr = validateExamDateNotPast(parsed.exam_date, parsed.entry_type)
      if (pastErr) return NextResponse.json({ message: pastErr }, { status: 400 })

      const { data: inserted, error: insErr } = await client
        .from('student_timetable_entries')
        .insert({
          user_id: user.id,
          upload_id: null,
          ...parsed,
        })
        .select('id')
        .single()

      if (insErr) return NextResponse.json({ message: insErr.message }, { status: 400 })
      await refreshUserReminders(user.id, client)
      return NextResponse.json({ ok: true, id: inserted?.id }, { status: 201 })
    }

    const list = body.entries as unknown[]
    if (!Array.isArray(list)) {
      return NextResponse.json({ message: 'entries[] required, or append: true with entry' }, { status: 400 })
    }

    if (list.length === 0) {
      await client.from('student_timetable_entries').delete().eq('user_id', user.id)
      await refreshUserReminders(user.id, client)
      return NextResponse.json({ ok: true, count: 0 }, { status: 200 })
    }

    const rows: {
      user_id: number
      day_of_week: string
      start_time: string
      end_time: string
      subject: string
      location: string | null
      notes: string | null
      entry_type: 'class' | 'exam'
      exam_date: string | null
    }[] = []

    for (const raw of list) {
      if (!raw || typeof raw !== 'object') continue
      const parsed = parseTimetableEntryInput(raw as Record<string, unknown>)
      if (!parsed) continue
      const batchPast = validateExamDateNotPast(parsed.exam_date, parsed.entry_type)
      if (batchPast) {
        return NextResponse.json({ message: batchPast }, { status: 400 })
      }
      rows.push({ user_id: user.id, ...parsed })
    }

    if (rows.length === 0) {
      return NextResponse.json({ message: 'No valid entries' }, { status: 400 })
    }

    await client.from('student_timetable_entries').delete().eq('user_id', user.id)
    const { error } = await client.from('student_timetable_entries').insert(rows)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    await refreshUserReminders(user.id, client)
    return NextResponse.json({ ok: true, count: rows.length }, { status: 200 })
  } catch (error) {
    console.error('timetable entries POST:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
