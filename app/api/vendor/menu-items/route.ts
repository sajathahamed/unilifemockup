import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/vendor/menu-items — list menu items for vendor's food stalls */
export async function GET() {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ items: [] })

    const client = await createClient()
    const { data: stalls } = await client.from('food_stalls').select('id').eq('owner_email', email)
    const stallIds = (stalls ?? []).map((s) => s.id)
    if (stallIds.length === 0) return NextResponse.json({ items: [], stalls: [] })

    const { data } = await client
      .from('food_stall_menu_items')
      .select('*')
      .in('food_stall_id', stallIds)
      .order('sort_order')

    return NextResponse.json({ items: data ?? [], stalls: stalls ?? [] })
  } catch (e) {
    console.error('Vendor menu-items GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/vendor/menu-items — create menu item */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const { food_stall_id, name, price, food_category, image_url } = body

    const client = await createClient()
    const { data: stall } = await client.from('food_stalls').select('id').eq('id', food_stall_id).eq('owner_email', email).single()
    if (!stall) return NextResponse.json({ message: 'Stall not found or not yours' }, { status: 400 })

    const { data, error } = await client
      .from('food_stall_menu_items')
      .insert({
        food_stall_id,
        name: String(name || '').trim() || 'Item',
        price: price != null ? parseFloat(String(price)) : 0,
        food_category: food_category ? String(food_category).trim() : null,
        image_url: image_url ? String(image_url).trim() : null,
        sort_order: 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('Vendor menu-items POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
