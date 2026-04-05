import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { previewTimetableReminders } from '@/lib/student-timetable-reminders.server'
import { normalizeSmsPhoneNumber } from '@/lib/student-phone.server'

/**
 * GET /api/student/timetable/reminder-preview
 * Returns the exact SMS `message` string that the cron job would send for each timetable row
 * (same as stored in `timetable_notifications.message` when scheduled).
 */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()
    const preview = await previewTimetableReminders(user.id, client)

    const { data: queued } = await client
      .from('timetable_notifications')
      .select('id, entry_id, message, notify_at, status')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .order('notify_at', { ascending: true })

    const { data: phoneRow } = await client
      .from('student_phones')
      .select('mobile')
      .eq('user_id', user.id)
      .maybeSingle()

    const normalizedPhone = normalizeSmsPhoneNumber(phoneRow?.mobile)

    return NextResponse.json(
      {
        default_lead_minutes: preview.default_lead_minutes,
        /** What would be sent / what wording looks like */
        preview: preview.reminders,
        /** Currently queued rows in DB (if any) */
        scheduled_in_db: queued || [],
        sms: {
          /** Cron looks up `student_phones.mobile` by your user id (same as trip SMS). */
          has_saved_phone: !!normalizedPhone,
          /** Last 4 digits only (for checking the right SIM without exposing full number). */
          destination_last4: normalizedPhone ? normalizedPhone.slice(-4) : null,
        },
        hint: 'Cron sends each `message` by SMS to your Profile mobile when notify_at is due.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('reminder-preview GET:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
