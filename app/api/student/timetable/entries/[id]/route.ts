import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { parseTimetableEntryInput, validateExamDateNotPast } from '@/lib/student-timetable-entry.shared'

/**
 * PATCH /api/student/timetable/entries/:id
 * - { reminderMinutesBefore } only → update reminder offset
 * - { day_of_week, start_time, end_time, subject, ... } → update slot (optional reminderMinutesBefore)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id: idParam } = await context.params
    const entryId = parseInt(idParam, 10)
    if (!Number.isFinite(entryId)) {
      return NextResponse.json({ message: 'Invalid entry id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const bodyKeys = Object.keys(body).filter((k) => body[k] !== undefined)
    const reminderOnly =
      bodyKeys.length === 1 && bodyKeys[0] === 'reminderMinutesBefore'

    const client = await createClient()

    const { data: row, error: fetchErr } = await client
      .from('student_timetable_entries')
      .select('id')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchErr) throw fetchErr
    if (!row) return NextResponse.json({ message: 'Entry not found' }, { status: 404 })

    const { refreshUserReminders } = await import('@/lib/student-timetable-reminders.server')

    if (reminderOnly) {
      const raw = body.reminderMinutesBefore
      let reminder_minutes_before: number | null
      if (raw === null) {
        reminder_minutes_before = null
      } else if (typeof raw === 'number' && Number.isFinite(raw)) {
        const n = Math.round(raw)
        if (n < 5 || n > 180) {
          return NextResponse.json({ message: 'Reminder must be between 5 and 180 minutes' }, { status: 400 })
        }
        reminder_minutes_before = n
      } else {
        return NextResponse.json(
          { message: 'reminderMinutesBefore must be a finite number (5–180) or null' },
          { status: 400 }
        )
      }

      const { error: upErr } = await client
        .from('student_timetable_entries')
        .update({ reminder_minutes_before })
        .eq('id', entryId)
        .eq('user_id', user.id)

      if (upErr) throw upErr
      await refreshUserReminders(user.id, client)
      return NextResponse.json({ ok: true, reminder_minutes_before })
    }

    const parsed = parseTimetableEntryInput(body)
    if (!parsed) {
      return NextResponse.json(
        {
          message:
            'Invalid slot: need day_of_week (Monday–Sunday), start_time and end_time (HH:MM), and subject.',
        },
        { status: 400 }
      )
    }
    const pastErr = validateExamDateNotPast(parsed.exam_date, parsed.entry_type)
    if (pastErr) return NextResponse.json({ message: pastErr }, { status: 400 })

    const updatePayload: Record<string, unknown> = { ...parsed }

    if (body.reminderMinutesBefore !== undefined) {
      const raw = body.reminderMinutesBefore
      if (raw === null) {
        updatePayload.reminder_minutes_before = null
      } else if (typeof raw === 'number' && Number.isFinite(raw)) {
        const n = Math.round(raw)
        if (n < 5 || n > 180) {
          return NextResponse.json({ message: 'Reminder must be between 5 and 180 minutes' }, { status: 400 })
        }
        updatePayload.reminder_minutes_before = n
      } else {
        return NextResponse.json(
          { message: 'reminderMinutesBefore must be a finite number (5–180) or null' },
          { status: 400 }
        )
      }
    }

    const { error: upErr } = await client
      .from('student_timetable_entries')
      .update(updatePayload)
      .eq('id', entryId)
      .eq('user_id', user.id)

    if (upErr) throw upErr
    await refreshUserReminders(user.id, client)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    console.error('timetable entry PATCH:', error)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

/**
 * DELETE /api/student/timetable/entries/:id
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id: idParam } = await context.params
    const entryId = parseInt(idParam, 10)
    if (!Number.isFinite(entryId)) {
      return NextResponse.json({ message: 'Invalid entry id' }, { status: 400 })
    }

    const client = await createClient()
    const { error } = await client
      .from('student_timetable_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id)

    if (error) throw error

    const { refreshUserReminders } = await import('@/lib/student-timetable-reminders.server')
    await refreshUserReminders(user.id, client)

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    console.error('timetable entry DELETE:', error)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
