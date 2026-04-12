import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

async function resolveStallId(client: Awaited<ReturnType<typeof createClient>>, rawId: string): Promise<number | null> {
  const decoded = decodeURIComponent(rawId)
  const asNumber = parseInt(decoded, 10)
  if (!isNaN(asNumber)) return asNumber
  const { data } = await client
    .from('food_stalls')
    .select('id')
    .eq('owner_email', decoded.toLowerCase())
    .maybeSingle()
  return data?.id ?? null
}

async function getMenuItemsForStall(client: Awaited<ReturnType<typeof createClient>>, stallId: number) {
  const { data: items } = await client.from('food_items').select('*').eq('vendor_id', stallId)
  const ids = (items ?? []).map((x) => x.category_id).filter((x): x is number => typeof x === 'number')
  const { data: categories } = ids.length
    ? await client.from('food_categories').select('id, name').in('id', ids)
    : { data: [] as { id: number; name: string }[] }
  const map = new Map<number, string>((categories ?? []).map((c) => [c.id, c.name]))
  return (items ?? []).map((m) => ({
    ...m,
    food_category: (typeof m.category_id === 'number' ? map.get(m.category_id) : '') || '',
  }))
}

async function resolveCategoryId(client: Awaited<ReturnType<typeof createClient>>, vendorId: number, name?: string) {
  const n = String(name || '').trim()
  if (!n) return null
  const { data: existing } = await client
    .from('food_categories')
    .select('id')
    .eq('vendor_id', vendorId)
    .ilike('name', n)
    .maybeSingle()
  if (existing?.id) return existing.id as number
  const { data: created } = await client
    .from('food_categories')
    .insert({ vendor_id: vendorId, name: n })
    .select('id')
    .single()
  return (created?.id as number | undefined) ?? null
}

/** GET /api/admin/food-stalls/[id] — get single stall with menu items */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { id } = await params
    const numId = await resolveStallId(client, id)
    if (!numId) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
    const { data: stall, error: stallError } = await client.from('food_stalls').select('*').eq('id', numId).single()
    if (stallError || !stall) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const menuItems = await getMenuItemsForStall(client, numId)
    return NextResponse.json({ ...stall, menu_items: menuItems })
  } catch (e) {
    console.error('Admin food-stalls GET [id] error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function parseTime(v: unknown): string | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  return s || null
}

/** PUT /api/admin/food-stalls/[id] — update food stall */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      shop_name,
      owner_name,
      owner_email,
      phone,
      whatsapp,
      address,
      city,
      area,
      lat,
      lng,
      description,
      opening_time,
      closing_time,
      days_open,
      category,
      logo,
      banner,
      gallery,
      menu_items,
    } = body

    if (!shop_name?.trim()) return NextResponse.json({ message: 'Shop name is required' }, { status: 400 })
    if (!owner_name?.trim()) return NextResponse.json({ message: 'Owner name is required' }, { status: 400 })
    if (!owner_email?.trim()) return NextResponse.json({ message: 'Owner email is required' }, { status: 400 })

    const email = String(owner_email).trim().toLowerCase()
    const client = await createClient()
    const { id } = await params
    const numId = await resolveStallId(client, id)
    if (!numId) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    // One email cannot be in both food and laundry
    const { data: inLaundry } = await client.from('laundry_shops').select('id').eq('owner_email', email).limit(1).maybeSingle()
    if (inLaundry) return NextResponse.json({ message: 'This email is already used for a laundry shop. One email can only be food stall OR laundry.' }, { status: 400 })
    // One email can only own one food stall (exclude the current stall when editing)
    const { data: inFood } = await client
      .from('food_stalls')
      .select('id')
      .eq('owner_email', email)
      .neq('id', numId)
      .limit(1)
      .maybeSingle()
    if (inFood) return NextResponse.json({ message: 'This account already has a food stall. One account can only have one shop.' }, { status: 400 })
    const { error } = await client
      .from('food_stalls')
      .update({
        shop_name: String(shop_name).trim(),
        owner_name: String(owner_name).trim(),
        owner_email: email,
        phone: phone ? String(phone).trim() : null,
        whatsapp: whatsapp ? String(whatsapp).trim() : null,
        address: address ? String(address).trim() : null,
        city: city ? String(city).trim() : null,
        area: area ? String(area).trim() : null,
        lat: lat != null && lat !== '' ? parseFloat(String(lat)) : null,
        lng: lng != null && lng !== '' ? parseFloat(String(lng)) : null,
        description: description ? String(description).trim() : null,
        opening_time: parseTime(opening_time) || null,
        closing_time: parseTime(closing_time) || null,
        days_open: Array.isArray(days_open) ? days_open : null,
        category: category ? String(category).trim() : null,
        logo: logo ? String(logo).trim() : null,
        banner: banner ? String(banner).trim() : null,
        gallery: Array.isArray(gallery) ? gallery : null,
      })
      .eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    await client.from('users').update({ role: 'vendor-food' }).eq('email', email)

    if (Array.isArray(menu_items)) {
      const { error: deleteMenuError } = await client.from('food_items').delete().eq('vendor_id', numId)
      if (deleteMenuError) return NextResponse.json({ message: `Failed to refresh menu items: ${deleteMenuError.message}` }, { status: 400 })

      if (menu_items.length > 0) {
        const rows = []
        for (const m of menu_items as { name?: string; price?: number | string; food_category?: string; image_url?: string }[]) {
          const category_id = await resolveCategoryId(client, numId, m.food_category)
          rows.push({
            vendor_id: numId,
            name: m.name ? String(m.name).trim() : 'Item',
            price: m.price != null && String(m.price).trim() !== '' ? parseFloat(String(m.price)) : 0,
            category_id,
            image_url: m.image_url ? String(m.image_url).trim() : null,
            is_available: true,
          })
        }
        const { error: insertMenuError } = await client.from('food_items').insert(rows)
        if (insertMenuError) return NextResponse.json({ message: `Failed to save menu items: ${insertMenuError.message}` }, { status: 400 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin food-stalls PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/food-stalls/[id] — delete food stall */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { id } = await params
    const numId = await resolveStallId(client, id)
    if (!numId) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
    const { error } = await client.from('food_stalls').delete().eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin food-stalls DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
