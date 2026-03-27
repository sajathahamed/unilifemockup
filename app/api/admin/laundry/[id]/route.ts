import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/laundry/[id] — get single laundry shop */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data, error } = await client.from('laundry_shops').select('*').eq('id', numId).single()
    if (error || !data) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('Admin laundry GET [id] error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function parseTime(v: unknown): string | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  return s || null
}

/** PUT /api/admin/laundry/[id] — update laundry shop */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

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
    if (!owner_email?.trim()) return NextResponse.json({ message: 'Owner email is required' }, { status: 400 })

    const email = String(owner_email).trim().toLowerCase()
    const client = await createClient()

    // One email cannot be in both food and laundry
    const { data: inFood } = await client.from('food_stalls').select('id').eq('owner_email', email).limit(1).maybeSingle()
    if (inFood) return NextResponse.json({ message: 'This email is already used for a food stall. One email can only be food stall OR laundry.' }, { status: 400 })
    // One email can only own one laundry shop (exclude current shop while editing)
    const { data: inLaundry } = await client
      .from('laundry_shops')
      .select('id')
      .eq('owner_email', email)
      .neq('id', numId)
      .limit(1)
      .maybeSingle()
    if (inLaundry) return NextResponse.json({ message: 'This account already has a laundry shop. One account can only have one shop.' }, { status: 400 })
    const { error } = await client
      .from('laundry_shops')
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
      .eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    await client.from('users').update({ role: 'vendor-laundry' }).eq('email', email)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin laundry PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/laundry/[id] — delete laundry shop */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { error } = await client.from('laundry_shops').delete().eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin laundry DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
