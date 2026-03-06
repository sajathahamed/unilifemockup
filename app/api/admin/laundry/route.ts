import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

function parseTime(v: unknown): string | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  if (!s) return null
  return s
}

/** POST /api/admin/laundry — create laundry_shops row */
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
      services,
      price_list,
      pickup_delivery,
      delivery_radius,
      opening_time,
      closing_time,
      logo,
      banner,
      gallery,
    } = body

    if (!shop_name?.trim()) return NextResponse.json({ message: 'Shop name is required' }, { status: 400 })
    if (!owner_name?.trim()) return NextResponse.json({ message: 'Owner name is required' }, { status: 400 })
    if (!owner_email?.trim()) return NextResponse.json({ message: 'Owner email is required (links to login)' }, { status: 400 })

    const client = await createClient()
    const { data, error } = await client
      .from('laundry_shops')
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
        services: Array.isArray(services) ? services : null,
        price_list: price_list && typeof price_list === 'object' ? price_list : null,
        pickup_delivery: pickup_delivery === true || pickup_delivery === 'true',
        delivery_radius: delivery_radius != null && delivery_radius !== '' ? parseFloat(String(delivery_radius)) : null,
        opening_time: parseTime(opening_time) || null,
        closing_time: parseTime(closing_time) || null,
        logo: logo ? String(logo).trim() : null,
        banner: banner ? String(banner).trim() : null,
        gallery: Array.isArray(gallery) ? gallery : null,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e) {
    console.error('Admin laundry POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
