import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

function parseTime(v: unknown): string | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  if (!s) return null
  return s
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

    const client = await createClient()
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

    const items = Array.isArray(menu_items) ? menu_items : []
    if (items.length > 0) {
      const rows = items.map((m: { name?: string; price?: number; food_category?: string; image_url?: string }, i: number) => ({
        food_stall_id: stall.id,
        name: m.name ? String(m.name).trim() : 'Item',
        price: m.price != null && m.price !== '' ? parseFloat(String(m.price)) : 0,
        food_category: m.food_category ? String(m.food_category).trim() : null,
        image_url: m.image_url ? String(m.image_url).trim() : null,
        sort_order: i,
      }))
      await client.from('food_stall_menu_items').insert(rows)
    }

    return NextResponse.json({ ok: true, id: stall.id })
  } catch (e) {
    console.error('Admin food-stalls POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
