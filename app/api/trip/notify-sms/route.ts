import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { sendDialogSms } from '@/lib/dialog-sms.server'
import { normalizeSmsPhoneNumber } from '@/lib/student-phone.server'

/**
 * POST /api/trip/notify-sms
 * Send SMS notification when a trip is saved or updated.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { destination, days, travelers, totalBudget, isEdit } = body

    const client = await createClient()

    // Get user's phone number from users table
    const { data: userData } = await client
      .from('users')
      .select('mobile')
      .eq('id', user.id)
      .single()

    // Also check student_phones table
    let phone = userData?.mobile
    if (!phone) {
      const { data: phoneData } = await client
        .from('student_phones')
        .select('mobile')
        .eq('user_id', user.id)
        .single()
      phone = phoneData?.mobile
    }

    if (!phone) {
      return NextResponse.json({ message: 'No phone number saved' }, { status: 200 })
    }

    const normalizedPhone = normalizeSmsPhoneNumber(phone)
    if (!normalizedPhone) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 200 })
    }

    const action = isEdit ? 'updated' : 'saved'
    const budgetFormatted = `Rs ${Math.round(totalBudget).toLocaleString()}`
    
    const message = `UniLife Trip ${action}! Your ${days}-day trip to ${destination} for ${travelers} traveler${travelers > 1 ? 's' : ''} (${budgetFormatted}) is ready. View it in your dashboard.`

    const result = await sendDialogSms({
      number: normalizedPhone,
      text: message,
      clientRef: 'UniLifeTripNotify',
      campaignName: 'trip_notify',
    })

    if (!result.ok || result.gatewayReportedError) {
      console.error('[Trip SMS] Failed:', result)
      return NextResponse.json({ message: 'SMS send failed', sent: false }, { status: 200 })
    }

    return NextResponse.json({ 
      ok: true, 
      sent: true,
      message: `SMS sent to ***${normalizedPhone.slice(-4)}`
    })
  } catch (error) {
    console.error('[Trip SMS] Error:', error)
    return NextResponse.json({ message: 'Failed to send SMS' }, { status: 200 })
  }
}
