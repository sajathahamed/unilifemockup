import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

function candidateStatuses(input: string): string[] {
  const s = String(input || '').toLowerCase()
  const map: Record<string, string[]> = {
    pending: ['pending', 'new', 'confirmed', 'accepted'],
    new: ['new', 'pending', 'confirmed', 'accepted'],
    washing: ['washing', 'in_progress', 'processing', 'confirmed', 'accepted', 'picked_up'],
    // Prefer a forward-moving status if "ironing" is unsupported in DB.
    ironing: ['ironing', 'ready', 'ready_for_delivery', 'out_for_delivery', 'packed', 'in_progress', 'processing', 'accepted'],
    ready: ['ready', 'ready_for_delivery', 'out_for_delivery', 'packed'],
    completed: ['completed', 'delivered', 'done'],
    cancelled: ['cancelled', 'canceled', 'rejected'],
  }
  const base = map[s] ?? [s]
  return Array.from(new Set(base))
}

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
    if (!status) return NextResponse.json({ message: 'Invalid status' }, { status: 400 })

    const client = await createClient()
    const { data: order } = await client.from('laundry_orders').select('laundry_shop_id').eq('id', numId).single()
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: shop } = await client.from('laundry_shops').select('id').eq('id', order.laundry_shop_id).eq('owner_email', user.email?.toLowerCase()).single()
    if (!shop) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const attempts = candidateStatuses(String(status))
    let lastError: string | null = null
    for (const candidate of attempts) {
      const { error } = await client.from('laundry_orders').update({ status: candidate }).eq('id', numId)
      if (!error) return NextResponse.json({ ok: true, status: candidate })
      lastError = error.message
    }
    return NextResponse.json({ message: lastError || 'Failed to update status' }, { status: 400 })
  } catch (e) {
    console.error('Vendor laundry-orders PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
