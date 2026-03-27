import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

async function resolveCategoryId(client: Awaited<ReturnType<typeof createClient>>, vendorId: number, categoryName?: string) {
  const name = String(categoryName || '').trim()
  if (!name) return null
  const { data: existing } = await client
    .from('food_categories')
    .select('id')
    .eq('vendor_id', vendorId)
    .ilike('name', name)
    .maybeSingle()
  if (existing?.id) return existing.id as number
  const { data: created } = await client
    .from('food_categories')
    .insert({ vendor_id: vendorId, name })
    .select('id')
    .single()
  return (created?.id as number | undefined) ?? null
}

/** PUT /api/vendor/menu-items/[id] — update menu item */
export async function PUT(
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
    const { name, price, food_category, image_url, is_available } = body

    const client = await createClient()
    const { data: item } = await client.from('food_items').select('*').eq('id', numId).single()
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const stallId = (item as { vendor_id?: number }).vendor_id ?? null
    const { data: stall } = await client.from('food_stalls').select('id').eq('id', stallId).eq('owner_email', user.email?.toLowerCase()).single()
    if (!stall) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const updates: Record<string, unknown> = {}
    if (name != null) updates.name = String(name).trim() || 'Item'
    if (price != null) updates.price = parseFloat(String(price))
    if (food_category != null) updates.category_id = await resolveCategoryId(client, stallId || 0, food_category)
    if (image_url != null) updates.image_url = image_url ? String(image_url).trim() : null
    if (typeof is_available === 'boolean') updates.is_available = is_available

    const { error } = await client.from('food_items').update(updates).eq('id', numId)

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
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data: item } = await client.from('food_items').select('*').eq('id', numId).single()
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const stallId = (item as { vendor_id?: number }).vendor_id ?? null
    const { data: stall } = await client.from('food_stalls').select('id').eq('id', stallId).eq('owner_email', user.email?.toLowerCase()).single()
    if (!stall) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { error } = await client.from('food_items').delete().eq('id', numId)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor menu-items DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
