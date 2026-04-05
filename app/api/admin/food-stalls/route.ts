import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/food-stalls — list all food stalls (admin/super_admin) */
export async function GET() {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { data, error } = await client
      .from('food_stalls')
      .select('*')
      .order('id', { ascending: false })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('Admin food-stalls GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function parseTime(v: unknown): string | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  if (!s) return null
  return s
}

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

/** POST /api/admin/food-stalls — create food_stalls row + menu items */
export async function POST(request: NextRequest) {
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
    if (!owner_email?.trim()) return NextResponse.json({ message: 'Owner email is required (links to login)' }, { status: 400 })

    const email = String(owner_email).trim().toLowerCase()
    const client = await createClient()

    // One email cannot be assigned to both food and laundry — check laundry_shops
    const { data: existingLaundry } = await client.from('laundry_shops').select('id').eq('owner_email', email).limit(1).maybeSingle()
    if (existingLaundry) {
      return NextResponse.json({ message: 'This email is already registered for a laundry shop. One email can only be food stall OR laundry — not both.' }, { status: 400 })
    }
    // One email can only own one food stall
    const { data: existingFood } = await client.from('food_stalls').select('id').eq('owner_email', email).limit(1).maybeSingle()
    if (existingFood) {
      return NextResponse.json({ message: 'This account already has a food stall. One account can only have one shop.' }, { status: 400 })
    }

    const { data: stall, error: stallError } = await client
      .from('food_stalls')
      .insert({
        shop_name: String(shop_name).trim(),
        owner_name: String(owner_name).trim(),
        owner_email: String(owner_email).trim().toLowerCase(),
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
      .select('id')
      .single()

    if (stallError) return NextResponse.json({ message: stallError.message }, { status: 400 })
    if (!stall?.id) return NextResponse.json({ message: 'Failed to create stall' }, { status: 500 })

    // Update user role to vendor-food if user exists
    await client.from('users').update({ role: 'vendor-food' }).eq('email', email)

    const items = Array.isArray(menu_items) ? menu_items : []
    if (items.length > 0) {
      const rows = []
      for (const m of items as { name?: string; price?: number | string; food_category?: string; image_url?: string }[]) {
        const category_id = await resolveCategoryId(client, stall.id, m.food_category)
        rows.push({
          vendor_id: stall.id,
          name: m.name ? String(m.name).trim() : 'Item',
          price: m.price != null && String(m.price).trim() !== '' ? parseFloat(String(m.price)) : 0,
          category_id,
          image_url: m.image_url ? String(m.image_url).trim() : null,
          is_available: true,
        })
      }
      const { error: menuError } = await client.from('food_items').insert(rows)
      if (menuError) {
        return NextResponse.json({ message: `Food stall created, but menu save failed: ${menuError.message}` }, { status: 400 })
      }
    }

    return NextResponse.json({ ok: true, id: stall.id })
  } catch (e) {
    console.error('Admin food-stalls POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
