import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

const CATEGORY_TO_ID: Record<string, number> = {
  Main: 1,
  Snacks: 2,
  Sides: 3,
  Drinks: 4,
  Desserts: 5,
}

function toCategoryId(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s) return null
  if (/^\d+$/.test(s)) return parseInt(s, 10)
  return CATEGORY_TO_ID[s] ?? null
}

async function getVendorUser() {
  return (
    (await verifyRole('vendor')) ||
    (await verifyRole('vendor-food')) ||
    (await verifyRole('vendor-laundry'))
  )
}

/** PUT /api/vendor/menu-items/[id] — update menu item */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getVendorUser()
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    if (!user.id || user.id < 1) return NextResponse.json({ message: 'Missing vendor profile (users table)' }, { status: 400 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { name, price, food_category, category_id, image_url, inStock, is_available } = body

    const client = await createClient()
    const { data: item } = await client.from('food_items').select('vendor_id').eq('id', numId).single()
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    if (item.vendor_id !== user.id) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const updates: Record<string, unknown> = {}
    if (name != null) updates.name = String(name).trim() || 'Item'
    if (price != null) updates.price = parseFloat(String(price))
    const resolvedCategoryId = toCategoryId(category_id ?? food_category)
    if (resolvedCategoryId != null) updates.category_id = resolvedCategoryId
    if (image_url != null) updates.image_url = image_url ? String(image_url).trim() : null
    const available =
      typeof is_available === 'boolean'
        ? is_available
        : typeof inStock === 'boolean'
          ? inStock
          : null
    if (available != null) updates.is_available = available

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
    const user = await getVendorUser()
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    if (!user.id || user.id < 1) return NextResponse.json({ message: 'Missing vendor profile (users table)' }, { status: 400 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data: item } = await client.from('food_items').select('vendor_id').eq('id', numId).single()
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    if (item.vendor_id !== user.id) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { error } = await client.from('food_items').delete().eq('id', numId)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Vendor menu-items DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
