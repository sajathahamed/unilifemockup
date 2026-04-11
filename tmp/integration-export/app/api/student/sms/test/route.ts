import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { normalizeSmsPhoneNumber } from '@/lib/student-phone.server'
import { sendDialogSms } from '@/lib/dialog-sms.server'

export const runtime = 'nodejs'

/**
 * POST /api/student/sms/test
 * Sends one test SMS to the number saved in student_phones (same gateway as timetable reminders).
 */
export async function POST() {
  try {
    const user = await verifyRole('student')
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!user.id || user.id < 1) {
      return NextResponse.json(
        { message: 'Your account must be linked to a user record before testing SMS.' },
        { status: 400 }
      )
    }

    const client = await createClient()
    const { data: row, error: fetchErr } = await client
      .from('student_phones')
      .select('mobile')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchErr) {
      console.error('test-sms student_phones:', fetchErr)
      return NextResponse.json({ message: fetchErr.message }, { status: 500 })
    }

    const normalized = normalizeSmsPhoneNumber(row?.mobile)
    if (!normalized) {
      return NextResponse.json(
        {
          message:
            'No saved phone number. Save your mobile on this page first, then try the test again.',
        },
        { status: 400 }
      )
    }

    const text =
      'UniLife test: Timetable SMS is working. Class reminders will be sent to this number.'

    // Same Dialog payload defaults as POS marketing (RPOSbyUpview / restsaaspos); optional unique ref for support.
    const result = await sendDialogSms({
      number: normalized,
      text,
      clientRef: `RPOSbyUpview_UniLife_test_${user.id}_${Date.now()}`,
    })

    const destMasked =
      normalized.length > 8
        ? `${normalized.slice(0, 4)}…${normalized.slice(-4)}`
        : `···${normalized.slice(-4)}`

    if (!result.ok) {
      const missingMask =
        result.gatewayErrorHint?.toLowerCase().includes('mask') ||
        (typeof result.body === 'object' &&
          result.body != null &&
          (result.body as Record<string, unknown>).configurationError === 'MISSING_DIALOG_SMS_MASK')
      return NextResponse.json(
        {
          message:
            result.gatewayErrorHint ||
            'SMS gateway HTTP request failed. Check Dialog credentials and network.',
          fix: missingMask
            ? 'Add the same mask your POS uses (vendor_row.mask) to .env.local as DIALOG_SMS_MASK (or DIALOG_MARKETING_MASK / DIALOG_POS_MASK), then restart npm run dev.'
            : undefined,
          detail: result.body,
          httpStatus: result.httpStatus,
          destination_masked: destMasked,
        },
        { status: missingMask ? 503 : 502 }
      )
    }

    if (result.gatewayReportedError) {
      const hint = result.gatewayErrorHint || 'Unknown gateway error'
      const invalidMask = hint.includes('INVALID_MASK')
      return NextResponse.json(
        {
          message: invalidMask
            ? 'Dialog rejected the sender ID (INVALID_MASK).'
            : 'Dialog answered OK over HTTP, but the response body says the SMS was not accepted.',
          hint,
          fix: invalidMask
            ? 'In Dialog Rich Communication, note your approved sender / mask name. Set server env DIALOG_SMS_MASK to that exact value (not "Unilife" unless it is registered for your account). Restart the app and test again.'
            : undefined,
          gateway: result.body,
          destination_masked: destMasked,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      sent_to_suffix: normalized.slice(-4),
      destination_masked: destMasked,
      gateway: result.body,
      note:
        'If delivery is slow, wait a few minutes. If you previously saw INVALID_MASK, keep DIALOG_SMS_MASK set to your Dialog-approved sender name.',
    })
  } catch (e) {
    console.error('POST /api/student/sms/test:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
