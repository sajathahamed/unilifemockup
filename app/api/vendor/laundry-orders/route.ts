import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/vendor/laundry-orders — laundry orders for vendor's shops (vendor-laundry only) */
export async function GET() {
  try {
    const user = await verifyRole('vendor-laundry')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ orders: [] })

    const client = await createClient()
    const { data: shops } = await client.from('laundry_shops').select('id').eq('owner_email', email)
    const shopIds = (shops ?? []).map((s) => s.id)
    if (shopIds.length === 0) return NextResponse.json({ orders: [] })

    const { data } = await client
      .from('laundry_orders')
      .select('*')
      .in('laundry_shop_id', shopIds)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders: data ?? [] })
  } catch (e) {
    console.error('Vendor laundry-orders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/vendor/laundry-orders — create order (vendor creates on behalf of customer) */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('vendor-laundry')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const { laundry_shop_id, customer_name, customer_phone, service, items_count, total_amount, address } = body

    const client = await createClient()
    const { data: shop } = await client.from('laundry_shops').select('id').eq('id', laundry_shop_id).eq('owner_email', email).single()
    if (!shop) return NextResponse.json({ message: 'Shop not found or not yours' }, { status: 400 })

    const { data, error } = await client
      .from('laundry_orders')
      .insert({
        laundry_shop_id,
        customer_name: String(customer_name || '').trim() || 'Customer',
        customer_phone: customer_phone ? String(customer_phone).trim() : null,
        service: String(service || 'Wash').trim(),
        items_count: items_count != null ? parseInt(String(items_count), 10) : 1,
        total_amount: total_amount != null ? parseFloat(String(total_amount)) : 0,
        status: 'new',
        address: address ? String(address).trim() : null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('Vendor laundry-orders POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
