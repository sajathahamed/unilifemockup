import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** PATCH /api/vendor/laundry-orders/[id] — update order status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('vendor-laundry')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { status } = body
    const valid = ['new', 'washing', 'ironing', 'ready', 'completed', 'cancelled']
    if (!status || !valid.includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 })

    const client = await createClient()
    const { data: order } = await client.from('laundry_orders').select('laundry_shop_id').eq('id', numId).single()
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: shop } = await client.from('laundry_shops').select('id').eq('id', order.laundry_shop_id).eq('owner_email', user.email?.toLowerCase()).single()
    if (!shop) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { error } = await client.from('laundry_orders').update({ status }).eq('id', numId)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor laundry-orders PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
