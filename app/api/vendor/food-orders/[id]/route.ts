import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** PATCH /api/vendor/food-orders/[id] — update order status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { status, delivery_type, delivery_agent_id, delivery_address, map_link } = body
    const valid = ['new', 'preparing', 'ready', 'completed', 'cancelled']
    if (!status || !valid.includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 })

    const client = await createClient()
    const { data: order } = await client
      .from('food_orders')
      .select('id, food_stall_id, notes')
      .eq('id', numId)
      .single()
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: stall } = await client.from('food_stalls').select('id').eq('id', order.food_stall_id).eq('owner_email', user.email?.toLowerCase()).single()
    if (!stall) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const updates: Record<string, unknown> = { status }

    // On vendor confirm-delivery step, require explicit pickup/delivery choice
    if (status === 'completed') {
      if (delivery_type !== 'pickup' && delivery_type !== 'delivery') {
        return NextResponse.json({ message: 'Choose pickup or delivery.' }, { status: 400 })
      }

      const cleanedAddress = delivery_address ? String(delivery_address).trim() : ''
      const cleanedMapLink = map_link ? String(map_link).trim() : ''
      const noteLines: string[] = []
      noteLines.push(`Type: ${delivery_type}`)
      if (cleanedAddress) noteLines.push(`Location: ${cleanedAddress}`)
      if (cleanedMapLink) noteLines.push(`Map: ${cleanedMapLink}`)
      const baseNotes = order.notes ? String(order.notes).trim() : ''
      updates.notes = [baseNotes, noteLines.join(' | ')].filter(Boolean).join('\n')
      if (cleanedAddress) updates.delivery_address = cleanedAddress

      if (delivery_type === 'delivery') {
        const agentId = Number(delivery_agent_id)
        if (!Number.isFinite(agentId) || agentId <= 0) {
          return NextResponse.json({ message: 'Select a delivery person.' }, { status: 400 })
        }
        if (!cleanedAddress) {
          return NextResponse.json({ message: 'Delivery location is required.' }, { status: 400 })
        }

        const { data: agent } = await client
          .from('users')
          .select('id, name, email, role')
          .eq('id', agentId)
          .single()
        if (!agent || agent.role !== 'delivery') {
          return NextResponse.json({ message: 'Selected user is not a delivery person.' }, { status: 400 })
        }

        // Keep one assignment row per order.
        const { data: existingDelivery } = await client
          .from('deliveries')
          .select('id')
          .eq('order_id', numId)
          .maybeSingle()
        if (existingDelivery?.id) {
          const { error: updateDeliveryError } = await client
            .from('deliveries')
            .update({ delivery_agent_id: agentId, status: 'assigned' })
            .eq('id', existingDelivery.id)
          if (updateDeliveryError) return NextResponse.json({ message: updateDeliveryError.message }, { status: 400 })
        } else {
          const { error: insertDeliveryError } = await client
            .from('deliveries')
            .insert({ order_id: numId, delivery_agent_id: agentId, status: 'assigned' })
          if (insertDeliveryError) return NextResponse.json({ message: insertDeliveryError.message }, { status: 400 })
        }

        // Notification entry for delivery audience with assignee context.
        await client.from('announcements').insert({
          title: `New delivery assigned (${numId})`,
          body: `${agent.name} (${agent.email}) assigned for order #ORD-${numId}${cleanedAddress ? `. Drop: ${cleanedAddress}` : ''}${cleanedMapLink ? `. Map: ${cleanedMapLink}` : ''}`,
          target_audience: 'delivery',
          created_by: user.id,
        })
      }
    }

    const { error } = await client.from('food_orders').update(updates).eq('id', numId)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor food-orders PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
