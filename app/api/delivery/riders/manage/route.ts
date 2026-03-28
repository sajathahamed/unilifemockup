import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

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

    if (cleanName.length < 2) {
      return NextResponse.json({ message: 'Name must be at least 2 characters' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 })
    }
    if (cleanPhone && cleanPhone.length < 9) {
      return NextResponse.json({ message: 'Enter a valid phone number' }, { status: 400 })
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
      phone: cleanPhone || null,
      is_available: true
    })

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
    if (name && String(name).trim().length >= 2) updates.name = String(name).trim()
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) updates.email = String(email).trim().toLowerCase()

    if (Object.keys(updates).length > 0) {
      const { error } = await client.from('users').update(updates).eq('id', rider_id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    }

    // Update delivery_agents
    const agentUpdates: Record<string, any> = {}
    if (name && String(name).trim().length >= 2) agentUpdates.name = String(name).trim()
    if (phone !== undefined) agentUpdates.phone = String(phone).trim() || null

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
