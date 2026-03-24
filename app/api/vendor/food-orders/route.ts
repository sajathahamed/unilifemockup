import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/vendor/food-orders — food orders for vendor's stalls (optionally filtered by stall) */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ orders: [] })

    const client = await createClient()
    const { data: stalls } = await client.from('food_stalls').select('id').eq('owner_email', email)
    const stallIds = (stalls ?? []).map((s) => s.id)
    if (stallIds.length === 0) return NextResponse.json({ orders: [] })

    const requestedStallId = Number(request.nextUrl.searchParams.get('food_stall_id') || '')
    const hasRequestedStall = Number.isFinite(requestedStallId) && requestedStallId > 0
    const scopedStallIds = hasRequestedStall
      ? stallIds.filter((id) => id === requestedStallId)
      : stallIds
    if (scopedStallIds.length === 0) return NextResponse.json({ orders: [] })

    const { data } = await client
      .from('food_orders')
      .select('*')
      .in('food_stall_id', scopedStallIds)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders: data ?? [] })
  } catch (e) {
    console.error('Vendor food-orders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/vendor/food-orders — create order */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const { food_stall_id, customer_name, customer_phone, items, total_amount, address } = body

    const client = await createClient()
    const { data: stall } = await client.from('food_stalls').select('id').eq('id', food_stall_id).eq('owner_email', email).single()
    if (!stall) return NextResponse.json({ message: 'Stall not found or not yours' }, { status: 400 })

    const { data, error } = await client
      .from('food_orders')
      .insert({
        food_stall_id,
        customer_name: String(customer_name || '').trim() || 'Customer',
        customer_phone: customer_phone ? String(customer_phone).trim() : null,
        items: typeof items === 'string' ? items : items ? JSON.stringify(items) : null,
        total_amount: total_amount != null ? parseFloat(String(total_amount)) : 0,
        status: 'new',
        address: address ? String(address).trim() : null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('Vendor food-orders POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
