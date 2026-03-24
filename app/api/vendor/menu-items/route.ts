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

/** GET /api/vendor/menu-items — list menu items for vendor's food stalls (optionally filtered by stall) */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ items: [] })

    const client = await createClient()
    const { data: stalls } = await client.from('food_stalls').select('id, shop_name').eq('owner_email', email)
    const stallIds = (stalls ?? []).map((s) => s.id)
    if (stallIds.length === 0) return NextResponse.json({ items: [], stalls: [] })

    const requestedStallId = Number(request.nextUrl.searchParams.get('food_stall_id') || '')
    const hasRequestedStall = Number.isFinite(requestedStallId) && requestedStallId > 0
    const scopedStallIds = hasRequestedStall
      ? stallIds.filter((id) => id === requestedStallId)
      : stallIds
    if (scopedStallIds.length === 0) {
      return NextResponse.json({ items: [], stalls: stalls ?? [] })
    }

    const { data: items } = await client
      .from('food_items')
      .select('*')
      .in('vendor_id', scopedStallIds)
      .order('id', { ascending: false })
    const catIds = (items ?? []).map((x) => x.category_id).filter((x): x is number => typeof x === 'number')
    const { data: cats } = catIds.length
      ? await client.from('food_categories').select('id, name').in('id', catIds)
      : { data: [] as { id: number; name: string }[] }
    const catMap = new Map<number, string>((cats ?? []).map((c) => [c.id, c.name]))
    const mapped = (items ?? []).map((m) => ({
      ...m,
      food_stall_id: m.vendor_id,
      food_category: (typeof m.category_id === 'number' ? catMap.get(m.category_id) : '') || '',
    }))

    return NextResponse.json({ items: mapped, stalls: stalls ?? [] })
  } catch (e) {
    console.error('Vendor menu-items GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/vendor/menu-items — create menu item */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const { food_stall_id, name, price, food_category, image_url } = body

    const client = await createClient()
    const { data: stall } = await client.from('food_stalls').select('id').eq('id', food_stall_id).eq('owner_email', email).single()
    if (!stall) return NextResponse.json({ message: 'Stall not found or not yours' }, { status: 400 })

    const category_id = await resolveCategoryId(client, food_stall_id, food_category)
    const { data, error } = await client
      .from('food_items')
      .insert({
        vendor_id: food_stall_id,
        name: String(name || '').trim() || 'Item',
        price: price != null ? parseFloat(String(price)) : 0,
        category_id,
        image_url: image_url ? String(image_url).trim() : null,
        is_available: true,
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
