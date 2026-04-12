import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { sendDialogSms } from '@/lib/dialog-sms.server'
import { normalizeSmsPhoneNumber } from '@/lib/student-phone.server'
import { buildTimetableReminderMessage, resolveSlotStart } from '@/lib/student-timetable-reminders.server'

/**
 * POST /api/student/timetable/test-sms
 * Send an immediate test SMS for a timetable entry (test mode).
 * Body: { entryId?: number, subject?: string, location?: string, entry_type?: 'class' | 'exam' }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[Test SMS] Request body:', body)
    
    const client = await createClient()

    // Get user's phone number
    const { data: userData, error: userError } = await client
      .from('users')
      .select('mobile, timetable_reminder_minutes')
      .eq('id', user.id)
      .single()

    console.log('[Test SMS] User data:', { mobile: userData?.mobile ? '***' + userData.mobile.slice(-4) : null, error: userError?.message })

    if (!userData?.mobile) {
      return NextResponse.json(
        { message: 'No mobile number saved. Add your phone in Profile to receive SMS.' },
        { status: 400 }
      )
    }

    const phone = normalizeSmsPhoneNumber(userData.mobile)
    console.log('[Test SMS] Normalized phone:', phone ? '***' + phone.slice(-4) : 'invalid')
    
    if (!phone) {
      return NextResponse.json(
        { message: 'Invalid mobile number format. Update in Profile.' },
        { status: 400 }
      )
    }

    const defaultLeadMins = userData.timetable_reminder_minutes ?? 15
    let message: string
    let subject: string
    let entryType: 'class' | 'exam' = 'class'

    // If entryId is provided, fetch the entry details
    if (body.entryId) {
      const { data: entry } = await client
        .from('student_timetable_entries')
        .select('*')
        .eq('id', body.entryId)
        .eq('user_id', user.id)
        .single()

      if (!entry) {
        return NextResponse.json({ message: 'Entry not found' }, { status: 404 })
      }

      const leadMins = entry.reminder_minutes_before ?? defaultLeadMins
      const occurrenceAt = resolveSlotStart(entry)
      message = buildTimetableReminderMessage(entry, leadMins, occurrenceAt)
      subject = entry.subject || 'Class'
      entryType = entry.entry_type === 'exam' ? 'exam' : 'class'
    } else {
      // Use provided details for newly added slot
      subject = body.subject || 'Class'
      entryType = body.entry_type === 'exam' ? 'exam' : 'class'
      const location = body.location ? ` at ${body.location}` : ''
      const day = body.day_of_week || 'upcoming day'
      const time = body.start_time || ''
      
      message = entryType === 'exam'
        ? `TEST: Your ${subject} exam has been added to your timetable. Scheduled for ${day}${time ? ` at ${time}` : ''}${location}.`
        : `TEST: Your ${subject} class has been added to your timetable. Scheduled for ${day}${time ? ` at ${time}` : ''}${location}.`
    }

    console.log('[Test SMS] Sending message:', { to: '***' + phone.slice(-4), messageLength: message.length })

    // Send the SMS
    const result = await sendDialogSms({
      number: phone,
      text: message,
      clientRef: 'UniLifeTimetableTest',
      campaignName: 'timetable_test',
    })

    console.log('[Test SMS] Result:', { 
      ok: result.ok, 
      httpStatus: result.httpStatus, 
      gatewayError: result.gatewayReportedError,
      hint: result.gatewayErrorHint,
      body: typeof result.body === 'string' ? result.body.slice(0, 200) : JSON.stringify(result.body).slice(0, 200)
    })

    if (!result.ok) {
      console.error('[Test SMS] HTTP error:', result)
      return NextResponse.json(
        { 
          message: `SMS send failed (HTTP ${result.httpStatus}). Check Dialog SMS credentials.`,
          debug: { httpStatus: result.httpStatus }
        },
        { status: 500 }
      )
    }

    if (result.gatewayReportedError) {
      console.error('[Test SMS] Gateway error:', result.gatewayErrorHint)
      return NextResponse.json(
        { message: `SMS gateway error: ${result.gatewayErrorHint || 'Unknown'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: `Test SMS sent to ***${phone.slice(-4)}`,
      subject,
      entryType,
    })
  } catch (error) {
    console.error('Test SMS error:', error)
    return NextResponse.json({ message: 'Failed to send test SMS' }, { status: 500 })
  }
}
