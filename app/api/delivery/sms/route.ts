import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import * as crypto from 'crypto'

/**
 * POST /api/delivery/sms — Send SMS via Dialog Rich Communication API.
 * Body: { phone: string, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { phone, message } = body

    if (!phone || !message) {
      return NextResponse.json({ message: 'phone and message are required' }, { status: 400 })
    }

    // Clean phone number — ensure it's digits only or with + prefix
    let cleanPhone = String(phone).replace(/[^\d+]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.slice(1)
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.slice(1)
    }

    if (cleanPhone.length < 9) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 })
    }

    const username = process.env.DIALOG_SMS_USER || 'Upview'
    const password = process.env.DIALOG_SMS_PASSWORD || 'Upv!3w@321'
    const mask = process.env.DIALOG_SMS_MASK || 'BMF'
    const digest = crypto.createHash('md5').update(password).digest('hex')

    // Get time in Asia/Colombo YYYY-MM-DDTHH:mm:ss
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Colombo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })
    const now = formatter.format(new Date()).replace(' ', 'T')

    const requestData = {
      messages: [
        {
          clientRef: 'RPOSbyUpview',
          number: cleanPhone,
          mask: mask,
          text: message,
          campaignName: 'restsaaspos',
        },
      ],
    }

    const smsRes = await fetch('https://richcommunication.dialog.lk/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        USER: username,
        DIGEST: digest,
        CREATED: now,
      },
      body: JSON.stringify(requestData),
    })

    const smsData = await smsRes.json().catch(() => null)

    if (smsData?.resultDesc === 'SUCCESS') {
      return NextResponse.json({ success: true, message: 'SMS sent successfully' })
    } else {
      console.warn('Dialog SMS response:', smsData)
      return NextResponse.json({
        success: false,
        message: 'SMS send attempted',
        dialog_response: smsData,
      })
    }
  } catch (e) {
    console.error('SMS send error:', e)
    return NextResponse.json({ message: 'Failed to send SMS' }, { status: 500 })
  }
}
