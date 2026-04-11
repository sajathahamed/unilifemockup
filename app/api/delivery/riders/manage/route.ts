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
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { rider_id, name, phone, email } = body

    if (!rider_id) return NextResponse.json({ message: 'rider_id is required' }, { status: 400 })

    const client = await createClient()

    // Verify rider exists
    const { data: existing } = await client
      .from('users')
      .select('id, role')
      .eq('id', rider_id)
      .eq('role', 'delivery')
      .single()

    if (!existing) return NextResponse.json({ message: 'Rider not found' }, { status: 404 })

    const updates: Record<string, any> = {}
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

    if (cleanName) updates.name = cleanName
    if (cleanEmail) updates.email = cleanEmail

    if (Object.keys(updates).length > 0) {
      const { error } = await client.from('users').update(updates).eq('id', rider_id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    }

    // Update delivery_agents
    const agentUpdates: Record<string, any> = {}
    if (cleanName) agentUpdates.name = cleanName
    if (cleanPhone !== undefined) agentUpdates.phone = cleanPhone || null

    if (Object.keys(agentUpdates).length > 0) {
      await client.from('delivery_agents').upsert({ id: rider_id, ...agentUpdates })
    }

    return NextResponse.json({ message: 'Rider updated successfully' })
  } catch (e) {
    console.error('Rider manage PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/delivery/riders/manage — Delete a rider.
 * Body: { rider_id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { rider_id } = body

    if (!rider_id) return NextResponse.json({ message: 'rider_id is required' }, { status: 400 })

    const client = await createClient()

    // Verify rider exists and has delivery role
    const { data: existing } = await client
      .from('users')
      .select('id, name, role')
      .eq('id', rider_id)
      .eq('role', 'delivery')
      .single()

    if (!existing) return NextResponse.json({ message: 'Rider not found' }, { status: 404 })

    // Check if rider has active deliveries
    const { data: activeDeliveries } = await client
      .from('deliveries')
      .select('id')
      .eq('delivery_agent_id', rider_id)
      .in('status', ['assigned', 'picked_up'])

    if (activeDeliveries && activeDeliveries.length > 0) {
      return NextResponse.json({
        message: `Cannot delete rider "${existing.name}" — they have ${activeDeliveries.length} active deliveries`,
      }, { status: 409 })
    }

    await client.from('delivery_agents').delete().eq('id', rider_id)

    // Delete rider
    const { error } = await client
      .from('users')
      .delete()
      .eq('id', rider_id)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    return NextResponse.json({ message: `Rider "${existing.name}" deleted successfully` })
  } catch (e) {
    console.error('Rider manage DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
