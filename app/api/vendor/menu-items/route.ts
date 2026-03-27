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

/** GET /api/vendor/menu-items — list menu items for vendor's food stalls */
export async function GET() {
  try {
    const user =
      (await verifyRole('vendor')) ||
      (await verifyRole('vendor-food')) ||
      (await verifyRole('vendor-laundry'))
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ items: [], stalls: [] })
    if (!user.id || user.id < 1) return NextResponse.json({ message: 'Missing vendor profile (users table)' }, { status: 400 })

    const client = await createClient()
    // Stalls are optional metadata for the UI. Items are sourced from `food_items`.
    const { data: stalls, error: stallsError } = await client
      .from('food_stalls')
      .select('id, shop_name')
      .ilike('owner_email', email)
      .order('id', { ascending: true })
    if (stallsError) {
      // Don't fail listing items if stalls lookup fails
      console.warn('[vendor/menu-items] stalls lookup failed:', stallsError.message)
    }

    const { data, error } = await client
      .from('food_items')
      .select('*')
      .eq('vendor_id', user.id)
      .order('id', { ascending: false })

    if (error) return NextResponse.json({ message: error.message, items: [], stalls: stalls ?? [] }, { status: 400 })
    return NextResponse.json({ items: data ?? [], stalls: stalls ?? [] })
  } catch (e) {
    console.error('Vendor menu-items GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/vendor/menu-items — create menu item */
export async function POST(request: NextRequest) {
  try {
    const user =
      (await verifyRole('vendor')) ||
      (await verifyRole('vendor-food')) ||
      (await verifyRole('vendor-laundry'))
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    if (!user.id || user.id < 1) return NextResponse.json({ message: 'Missing vendor profile (users table)' }, { status: 400 })

    const body = await request.json()
    const { name, price, food_category, category_id, image_url, inStock, is_available } = body

    const client = await createClient()
    const resolvedCategoryId = toCategoryId(category_id ?? food_category)
    if (!resolvedCategoryId) {
      return NextResponse.json({ message: 'Invalid category (category_id / food_category)' }, { status: 400 })
    }

    const available =
      typeof is_available === 'boolean'
        ? is_available
        : typeof inStock === 'boolean'
          ? inStock
          : true

    const category_id = await resolveCategoryId(client, food_stall_id, food_category)
    const { data, error } = await client
      .from('food_items')
      .insert({
        vendor_id: user.id,
        name: String(name || '').trim() || 'Item',
        price: price != null ? parseFloat(String(price)) : 0,
        category_id: resolvedCategoryId,
        image_url: image_url ? String(image_url).trim() : null,
        is_available: available,
      })
      .select()
      .single()
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({
      ...data,
      food_stall_id: data.vendor_id,
      food_category: food_category || '',
    })
  } catch (e) {
    console.error('Vendor menu-items POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
