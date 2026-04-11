import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

const COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
]

function colorFor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

function fmtTime(t: string): string {
  const s = String(t).slice(0, 8)
  if (s.length >= 5 && s[2] === ':') return s.slice(0, 5)
  return s
}

/**
 * GET /api/student/timetable
 * Personal timetable entries (from upload parse + manual edits).
 */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()

    // Use * so older DBs without reminder_minutes_before still work (column appears after migration).
    const { data: entries, error } = await client
      .from('student_timetable_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) throw error

    const { data: lastUpload } = await client
      .from('timetable_uploads')
      .select('id, status, parse_note, created_at, file_path')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: profile } = await client
      .from('users')
      .select('timetable_reminder_minutes')
      .eq('id', user.id)
      .single()

    const defaultRem = profile?.timetable_reminder_minutes ?? 15

    const rows = (entries || []).map((r: Record<string, unknown>) => {
      const subject = String(r.subject ?? '')
      const c = colorFor(subject)
      const perEntry = r.reminder_minutes_before
      const perEntryNum =
        perEntry != null && perEntry !== '' ? Number(perEntry) : null
      const effectiveReminder =
        perEntryNum != null && !Number.isNaN(perEntryNum) ? perEntryNum : defaultRem
      const entryType = r.entry_type === 'exam' ? 'exam' : 'class'
      const examDateRaw = r.exam_date
      const exam_date =
        entryType === 'exam' && examDateRaw != null && String(examDateRaw).trim() !== ''
          ? String(examDateRaw).slice(0, 10)
          : null
      return {
        id: Number(r.id),
        day_of_week: String(r.day_of_week ?? ''),
        start_time: fmtTime(String(r.start_time ?? '')),
        end_time: fmtTime(String(r.end_time ?? '')),
        location: String(r.location ?? ''),
        courseName: subject,
        courseCode: subject.length > 20 ? `${subject.slice(0, 18)}…` : subject,
        subject,
        notes: r.notes != null ? String(r.notes) : undefined,
        color: c,
        entry_type: entryType,
        exam_date,
        reminder_minutes_before:
          perEntryNum != null && !Number.isNaN(perEntryNum) ? perEntryNum : null,
        effectiveReminderMinutes: effectiveReminder,
      }
    })

    return NextResponse.json(
      {
        slots: rows,
        lastUpload: lastUpload || null,
        reminderMinutes: profile?.timetable_reminder_minutes ?? 15,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('student timetable GET:', error)
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

/**
 * PATCH /api/student/timetable
 * Update reminder minutes offset.
 */
export async function PATCH(request: Request) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { reminderMinutes } = await request.json()
    if (reminderMinutes === undefined) {
      return NextResponse.json({ message: 'reminderMinutes required' }, { status: 400 })
    }

    const client = await createClient()

    // 1. Update user profile
    const { error: upErr } = await client
      .from('users')
      .update({ timetable_reminder_minutes: Number(reminderMinutes) })
      .eq('id', user.id)

    if (upErr) throw upErr

    // 2. Re-schedule all reminders
    const { refreshUserReminders } = await import('@/lib/student-timetable-reminders.server')
    await refreshUserReminders(user.id, client)

    return NextResponse.json({ message: 'Reminders updated' })
  } catch (error: any) {
    console.error('timetable PATCH:', error)
    return NextResponse.json({ message: error.message || 'Error updating reminders' }, { status: 500 })
  }
}

