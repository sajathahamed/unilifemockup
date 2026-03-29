import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/delivery/orders — Fetch all food + laundry orders for the delivery admin.
 * Merges both order types into a unified list with delivery assignment status.
 * Query params: ?status=all|unassigned|assigned|picked_up|delivered&type=all|food|laundry
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const statusFilter = searchParams.get('status') || 'all'
    const typeFilter = searchParams.get('type') || 'all'

    const client = await createClient()

    // Fetch all deliveries to know which orders are already assigned
    const { data: deliveries } = await client
      .from('deliveries')
      .select('id, order_id, delivery_agent_id, status, updated_at')

    const deliveryMap = new Map<string, { delivery_id: string; rider_id: string; delivery_status: string; updated_at: string }>()
    for (const d of deliveries ?? []) {
      deliveryMap.set(String(d.order_id), {
        delivery_id: String(d.id),
        rider_id: String(d.delivery_agent_id),
        delivery_status: d.status ?? 'assigned',
        updated_at: d.updated_at ?? '',
      })
    }

    // Fetch rider names for display
    const { data: riders } = await client
      .from('users')
      .select('id, name, email')
      .eq('role', 'delivery')

    const riderMap = new Map<string, { name: string; email: string }>()
    for (const r of riders ?? []) {
      riderMap.set(String(r.id), { name: r.name, email: r.email })
    }

    const orders: any[] = []

    // ── Food Orders ──
    if (typeFilter === 'all' || typeFilter === 'food') {
      const { data: foodOrders } = await client
        .from('food_orders')
        .select('id, order_ref, customer_name, customer_phone, customer_email, items, total, status, delivery_address, notes, created_at, food_stall_id')
        .order('created_at', { ascending: false })

      for (const fo of foodOrders ?? []) {
        const assignment = deliveryMap.get(String(fo.id))
        const riderInfo = assignment ? riderMap.get(assignment.rider_id) : null

        orders.push({
          id: fo.id,
          order_ref: fo.order_ref || `FOOD-${fo.id}`,
          order_type: 'food',
          customer_name: fo.customer_name ?? 'Customer',
          customer_phone: fo.customer_phone ?? '',
          customer_email: fo.customer_email ?? '',
          items_summary: summarizeFoodItems(fo.items),
          total: Number(fo.total ?? 0),
          order_status: fo.status ?? 'new',
          delivery_address: fo.delivery_address ?? '',
          notes: fo.notes ?? '',
          created_at: fo.created_at,
          // Delivery assignment info
          is_assigned: !!assignment,
          delivery_id: assignment?.delivery_id ?? null,
          delivery_status: assignment?.delivery_status ?? null,
          rider_id: assignment?.rider_id ?? null,
          rider_name: riderInfo?.name ?? null,
          rider_email: riderInfo?.email ?? null,
        })
      }
    }

    // ── Laundry Orders ──
    if (typeFilter === 'all' || typeFilter === 'laundry') {
      const { data: laundryOrders } = await client
        .from('laundry_orders')
        .select('id, order_ref, customer_name, customer_phone, items_description, total, status, pickup_address, delivery_address, notes, created_at, laundry_shop_id')
        .order('created_at', { ascending: false })

      for (const lo of laundryOrders ?? []) {
        const assignment = deliveryMap.get(String(lo.id))
        const riderInfo = assignment ? riderMap.get(assignment.rider_id) : null

        orders.push({
          id: lo.id,
          order_ref: lo.order_ref || `LND-${lo.id}`,
          order_type: 'laundry',
          customer_name: lo.customer_name ?? 'Customer',
          customer_phone: lo.customer_phone ?? '',
          customer_email: '',
          items_summary: lo.items_description ?? 'Laundry service',
          total: Number(lo.total ?? 0),
          order_status: lo.status ?? 'pending',
          delivery_address: lo.delivery_address ?? lo.pickup_address ?? '',
          notes: lo.notes ?? '',
          created_at: lo.created_at,
          // Delivery assignment info
          is_assigned: !!assignment,
          delivery_id: assignment?.delivery_id ?? null,
          delivery_status: assignment?.delivery_status ?? null,
          rider_id: assignment?.rider_id ?? null,
          rider_name: riderInfo?.name ?? null,
          rider_email: riderInfo?.email ?? null,
        })
      }
    }

    // Apply status filter
    let filtered = orders
    if (statusFilter === 'unassigned') {
      filtered = orders.filter(o => !o.is_assigned)
    } else if (statusFilter === 'assigned') {
      filtered = orders.filter(o => o.is_assigned && o.delivery_status === 'assigned')
    } else if (statusFilter === 'picked_up') {
      filtered = orders.filter(o => o.delivery_status === 'picked_up')
    } else if (statusFilter === 'delivered') {
      filtered = orders.filter(o => o.delivery_status === 'delivered')
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Stats
    const stats = {
      total: orders.length,
      unassigned: orders.filter(o => !o.is_assigned).length,
      assigned: orders.filter(o => o.is_assigned && o.delivery_status === 'assigned').length,
      picked_up: orders.filter(o => o.delivery_status === 'picked_up').length,
      delivered: orders.filter(o => o.delivery_status === 'delivered').length,
    }

    return NextResponse.json({ orders: filtered, stats })
  } catch (e) {
    console.error('Delivery orders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** Parse food items JSON/string into a readable summary */
function summarizeFoodItems(items: unknown): string {
  try {
    const parsed = typeof items === 'string' ? JSON.parse(items) : items
    if (Array.isArray(parsed)) {
      return parsed
        .map((i: any) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`)
        .join(', ')
    }
  } catch { /* ignore */ }
  return 'Food order'
}
