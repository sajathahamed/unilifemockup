import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeSmsPhoneNumber } from '@/lib/student-phone.server'
import { sendDialogSms } from '@/lib/dialog-sms.server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  
  // Basic security check
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ message: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(url, key)
  const now = new Date().toISOString()

  // 1. Pending notifications (no embed: timetable_notifications has no FK to student_phones)
  const { data: notifications, error } = await supabase
    .from('timetable_notifications')
    .select('id, user_id, message, notify_at, status, entry_id, channel')
    .eq('status', 'scheduled')
    .lte('notify_at', now)
    .limit(50)

  if (error) {
    console.error('Cron fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ message: 'No notifications to send' })
  }

  const userIds = [...new Set(notifications.map((n) => n.user_id).filter(Boolean))]
  const { data: phoneRows, error: phoneErr } = await supabase
    .from('student_phones')
    .select('user_id, mobile')
    .in('user_id', userIds)

  if (phoneErr) {
    console.error('Cron student_phones fetch:', phoneErr)
    return NextResponse.json({ error: phoneErr.message }, { status: 500 })
  }

  const mobileByUserId = new Map<number, string>()
  for (const row of phoneRows || []) {
    const uid = row.user_id as number
    const normalized = normalizeSmsPhoneNumber(row.mobile as string)
    if (normalized) mobileByUserId.set(uid, normalized)
  }

  let sentCount = 0
  let failCount = 0

  // 2. Process each notification → student’s number in student_phones
  for (const n of notifications) {
    const raw = mobileByUserId.get(n.user_id as number)
    const mobile = raw || ''
    if (!mobile) {
      await supabase
        .from('timetable_notifications')
        .update({
          status: 'failed',
          sent_at: now,
          meta: { reason: 'no_student_phone', user_id: n.user_id },
        })
        .eq('id', n.id)
      failCount++
      continue
    }

    try {
      const msg = n.message || 'Class Reminder'
      const result = await sendDialogSms({
        number: mobile,
        text: msg,
        clientRef: `Remind_${n.id}`,
        campaignName: 'timetable_reminder',
      })

      if (result.ok && !result.gatewayReportedError) {
        await supabase.from('timetable_notifications').update({
          status: 'sent',
          sent_at: now,
          meta: result.body,
        }).eq('id', n.id)
        sentCount++
      } else {
        const detail = result.gatewayErrorHint || JSON.stringify(result.body)
        throw new Error(detail)
      }
    } catch (err: any) {
      console.error(`Failed to send notification ${n.id}:`, err)
      await supabase.from('timetable_notifications').update({ 
        status: 'failed', 
        sent_at: now,
        meta: { error: err.message } 
      }).eq('id', n.id)
      failCount++
    }
  }

  return NextResponse.json({ 
    processed: notifications.length,
    sent: sentCount,
    failed: failCount
  })
}
