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
    const { status } = body
    const valid = ['new', 'preparing', 'ready', 'completed', 'cancelled']
    if (!status || !valid.includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 })

    const client = await createClient()
    const { data: order } = await client.from('food_orders').select('food_stall_id').eq('id', numId).single()
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: stall } = await client.from('food_stalls').select('id').eq('id', order.food_stall_id).eq('owner_email', user.email?.toLowerCase()).single()
    if (!stall) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { error } = await client.from('food_orders').update({ status }).eq('id', numId)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor food-orders PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
