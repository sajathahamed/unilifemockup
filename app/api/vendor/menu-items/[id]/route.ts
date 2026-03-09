import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** PUT /api/vendor/menu-items/[id] — update menu item */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { name, price, food_category, image_url } = body

    const client = await createClient()
    const { data: item } = await client.from('food_stall_menu_items').select('food_stall_id').eq('id', numId).single()
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: stall } = await client.from('food_stalls').select('id').eq('id', item.food_stall_id).eq('owner_email', user.email?.toLowerCase()).single()
    if (!stall) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const updates: Record<string, unknown> = {}
    if (name != null) updates.name = String(name).trim() || 'Item'
    if (price != null) updates.price = parseFloat(String(price))
    if (food_category != null) updates.food_category = food_category ? String(food_category).trim() : null
    if (image_url != null) updates.image_url = image_url ? String(image_url).trim() : null

    const { error } = await client.from('food_stall_menu_items').update(updates).eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor menu-items PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/vendor/menu-items/[id] — delete menu item */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data: item } = await client.from('food_stall_menu_items').select('food_stall_id').eq('id', numId).single()
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: stall } = await client.from('food_stalls').select('id').eq('id', item.food_stall_id).eq('owner_email', user.email?.toLowerCase()).single()
    if (!stall) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { error } = await client.from('food_stall_menu_items').delete().eq('id', numId)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor menu-items DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
