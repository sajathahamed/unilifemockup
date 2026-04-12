import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import * as crypto from 'crypto'

const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/
const GMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@gmail\.com$/i
const PHONE_PATTERN = /^\d{10}$/

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

async function sendRiderWelcomeSms(phone: string, riderName: string) {
  try {
    let cleanPhone = String(phone).replace(/[^\d+]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.slice(1)
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.slice(1)
    }

    if (cleanPhone.length < 9) return

    const username = process.env.DIALOG_SMS_USER || 'Upview'
    const password = process.env.DIALOG_SMS_PASSWORD || 'Upv!3w@321'
    const mask = process.env.DIALOG_SMS_MASK || 'BMF'
    const digest = crypto.createHash('md5').update(password).digest('hex')

    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Colombo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })
    const now = formatter.format(new Date()).replace(' ', 'T')

    await fetch('https://richcommunication.dialog.lk/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        USER: username,
        DIGEST: digest,
        CREATED: now,
      },
      body: JSON.stringify({
        messages: [
          {
            clientRef: 'RPOSbyUpview',
            number: cleanPhone,
            mask,
            text: `Hi ${riderName}, your UniLife delivery rider account has been created successfully.`,
            campaignName: 'restsaaspos',
          },
        ],
      }),
    })
  } catch (error) {
    console.warn('Failed to send rider welcome SMS:', error)
  }
}

/**
 * POST /api/delivery/riders/manage — Create a new delivery rider.
 * Body: { name, email, phone }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { name, email, phone } = body

    const cleanName = String(name ?? '').trim()
    const cleanEmail = String(email ?? '').trim().toLowerCase()
    const cleanPhone = String(phone ?? '').trim()

    const normalizedPhone = normalizePhone(cleanPhone)

    if (!USERNAME_PATTERN.test(cleanName)) {
      return NextResponse.json({ message: 'Username must start with a letter and contain only letters or numbers' }, { status: 400 })
    }
    if (!GMAIL_PATTERN.test(cleanEmail)) {
      return NextResponse.json({ message: 'Email must be a valid Gmail address' }, { status: 400 })
    }
    if (!PHONE_PATTERN.test(normalizedPhone)) {
      return NextResponse.json({ message: 'Phone number must be exactly 10 digits' }, { status: 400 })
    }

    const client = await createClient()

    // Check if email already exists
    const { data: existing } = await client
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 })
    }

    // Insert rider into users table
    const { data: rider, error } = await client
      .from('users')
      .insert({
        name: cleanName,
        email: cleanEmail,
        role: 'delivery',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Create rider error:', error)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    // Insert into delivery_agents to satisfy deliveries FK
    await client.from('delivery_agents').insert({
      id: rider.id,
      name: cleanName,
      phone: normalizedPhone || null,
      is_available: true
    })

    await sendRiderWelcomeSms(normalizedPhone, cleanName)

    return NextResponse.json({ message: `Rider "${cleanName}" created successfully`, rider }, { status: 201 })
  } catch (e) {
    console.error('Rider manage POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/delivery/riders/manage — Update an existing rider.
 * Body: { rider_id, name?, phone?, email? }
 * Sends SMS to the rider's (new) phone if any credential changes.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { rider_id, name, phone, email } = body

    if (!rider_id) return NextResponse.json({ message: 'rider_id is required' }, { status: 400 })

    const client = await createClient()

    // Fetch existing rider data to compare and detect changes
    const { data: existing } = await client
      .from('users')
      .select('id, name, email, role')
      .eq('id', rider_id)
      .eq('role', 'delivery')
      .single()

    if (!existing) return NextResponse.json({ message: 'Rider not found' }, { status: 404 })

    // Fetch existing phone from delivery_agents
    const { data: existingAgent } = await client
      .from('delivery_agents')
      .select('phone')
      .eq('id', rider_id)
      .maybeSingle()

    const cleanName = name ? String(name).trim() : ''
    const cleanEmail = email ? String(email).trim().toLowerCase() : ''
    const cleanPhone = phone !== undefined ? normalizePhone(String(phone).trim()) : undefined

    if (cleanName && !USERNAME_PATTERN.test(cleanName)) {
      return NextResponse.json({ message: 'Username must start with a letter and contain only letters or numbers' }, { status: 400 })
    }
    if (cleanEmail && !GMAIL_PATTERN.test(cleanEmail)) {
      return NextResponse.json({ message: 'Email must be a valid Gmail address' }, { status: 400 })
    }
    if (cleanPhone !== undefined && cleanPhone !== '' && !PHONE_PATTERN.test(cleanPhone)) {
      return NextResponse.json({ message: 'Phone number must be exactly 10 digits' }, { status: 400 })
    }

    // Detect what changed for the SMS message
    const nameChanged = cleanName && cleanName !== existing.name
    const emailChanged = cleanEmail && cleanEmail !== existing.email
    const phoneChanged = cleanPhone !== undefined && cleanPhone !== '' && cleanPhone !== (existingAgent?.phone ?? '')

    const userUpdates: Record<string, any> = {}
    if (cleanName) userUpdates.name = cleanName
    if (cleanEmail) userUpdates.email = cleanEmail

    if (Object.keys(userUpdates).length > 0) {
      const { error } = await client.from('users').update(userUpdates).eq('id', rider_id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    }

    // Update delivery_agents
    const agentUpdates: Record<string, any> = {}
    if (cleanName) agentUpdates.name = cleanName
    if (cleanPhone !== undefined) agentUpdates.phone = cleanPhone || null

    if (Object.keys(agentUpdates).length > 0) {
      await client.from('delivery_agents').upsert({ id: rider_id, ...agentUpdates })
    }

    // Send SMS if any credential was changed
    const anyChanged = nameChanged || emailChanged || phoneChanged
    if (anyChanged) {
      const finalPhone = cleanPhone && cleanPhone !== '' ? cleanPhone : (existingAgent?.phone ?? '')
      if (finalPhone) {
        const finalName = cleanName || existing.name
        const finalEmail = cleanEmail || existing.email
        const smsLines: string[] = [
          `Hi ${finalName}, your UniLife rider account has been updated by admin.`,
        ]
        if (nameChanged) smsLines.push(`Username: ${finalName}`)
        if (emailChanged) smsLines.push(`Email: ${finalEmail}`)
        if (phoneChanged) smsLines.push(`Phone: ${cleanPhone}`)
        smsLines.push('Please use the updated details to log in.')
        await sendRiderWelcomeSms(finalPhone, smsLines.join('\n'))
      }
    }

    return NextResponse.json({ message: 'Rider updated successfully' })
  } catch (e) {
    console.error('Rider manage PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/delivery/riders/manage — Toggle active/inactive status of a rider.
 * Body: { rider_id, is_available: boolean }
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { rider_id, is_available } = body

    if (!rider_id) return NextResponse.json({ message: 'rider_id is required' }, { status: 400 })
    if (typeof is_available !== 'boolean') {
      return NextResponse.json({ message: 'is_available must be a boolean' }, { status: 400 })
    }

    const client = await createClient()

    // Verify rider exists and has delivery role
    const { data: existing } = await client
      .from('users')
      .select('id, name, role')
      .eq('id', rider_id)
      .eq('role', 'delivery')
      .single()

    if (!existing) return NextResponse.json({ message: 'Rider not found' }, { status: 404 })

    // Cannot deactivate a rider who has active deliveries
    if (!is_available) {
      const { data: activeDeliveries } = await client
        .from('deliveries')
        .select('id')
        .eq('delivery_agent_id', rider_id)
        .in('status', ['assigned', 'picked_up'])

      if (activeDeliveries && activeDeliveries.length > 0) {
        return NextResponse.json({
          message: `Cannot deactivate "${existing.name}" — they have ${activeDeliveries.length} active delivery(s). Reassign first.`,
        }, { status: 409 })
      }
    }

    await client.from('delivery_agents').upsert({ id: rider_id, is_available })

    const statusLabel = is_available ? 'activated' : 'deactivated'
    return NextResponse.json({ message: `Rider "${existing.name}" ${statusLabel} successfully`, is_available })
  } catch (e) {
    console.error('Rider manage PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
