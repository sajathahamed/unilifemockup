import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/vendor/my-store — get vendor's store (first food stall or laundry shop) */
export async function GET() {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ store: null, shopType: null })

    const client = await createClient()
    const { data: food } = await client.from('food_stalls').select('*').eq('owner_email', email).limit(1).maybeSingle()
    if (food) {
      const ot = food.opening_time
      const ct = food.closing_time
      return NextResponse.json({
        store: {
          id: food.id,
          name: food.shop_name,
          owner_name: food.owner_name,
          owner_email: food.owner_email,
          phone: food.phone || '',
          whatsapp: food.whatsapp || '',
          address: food.address || '',
          city: food.city || '',
          area: food.area || '',
          description: food.description || '',
          opening_time: ot ? String(ot).slice(0, 5) : '',
          closing_time: ct ? String(ct).slice(0, 5) : '',
          category: food.category || '',
          logo: food.logo || '',
          banner: food.banner || '',
          is_open: food.is_open !== false,
        },
        shopType: 'food',
      })
    }

    const { data: laundry } = await client.from('laundry_shops').select('*').eq('owner_email', email).limit(1).maybeSingle()
    if (laundry) {
      const ot = laundry.opening_time
      const ct = laundry.closing_time
      return NextResponse.json({
        store: {
          id: laundry.id,
          name: laundry.shop_name,
          owner_name: laundry.owner_name,
          owner_email: laundry.owner_email,
          phone: laundry.phone || '',
          whatsapp: laundry.whatsapp || '',
          address: laundry.address || '',
          city: laundry.city || '',
          area: laundry.area || '',
          description: '',
          opening_time: ot ? String(ot).slice(0, 5) : '',
          closing_time: ct ? String(ct).slice(0, 5) : '',
          logo: laundry.logo || '',
          banner: laundry.banner || '',
          is_open: laundry.is_open !== false,
        },
        shopType: 'laundry',
      })
    }

    return NextResponse.json({ store: null, shopType: null })
  } catch (e) {
    console.error('Vendor my-store GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/vendor/my-store — update store (vendor cannot change type; only editable fields) */
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const { id, shopType, name, owner_name, phone, whatsapp, address, city, area, description, opening_time, closing_time } = body

    if (!id || !shopType) return NextResponse.json({ message: 'Missing id or shopType' }, { status: 400 })

    const client = await createClient()

    if (shopType === 'food') {
      const { data: stall } = await client.from('food_stalls').select('id').eq('id', id).eq('owner_email', email).single()
      if (!stall) return NextResponse.json({ message: 'Store not found or not yours' }, { status: 404 })

      const updates: Record<string, unknown> = {}
      if (name != null) updates.shop_name = String(name).trim()
      if (owner_name != null) updates.owner_name = String(owner_name).trim()
      if (phone != null) updates.phone = phone ? String(phone).trim() : null
      if (whatsapp != null) updates.whatsapp = whatsapp ? String(whatsapp).trim() : null
      if (address != null) updates.address = address ? String(address).trim() : null
      if (city != null) updates.city = city ? String(city).trim() : null
      if (area != null) updates.area = area ? String(area).trim() : null
      if (description != null) updates.description = description ? String(description).trim() : null
      if (opening_time != null) updates.opening_time = opening_time !== '' ? String(opening_time) : null
      if (closing_time != null) updates.closing_time = closing_time !== '' ? String(closing_time) : null

      const { error } = await client.from('food_stalls').update(updates).eq('id', id).eq('owner_email', email)

      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    if (shopType === 'laundry') {
      const { data: shop } = await client.from('laundry_shops').select('id').eq('id', id).eq('owner_email', email).single()
      if (!shop) return NextResponse.json({ message: 'Store not found or not yours' }, { status: 404 })

      const updates: Record<string, unknown> = {}
      if (name != null) updates.shop_name = String(name).trim()
      if (owner_name != null) updates.owner_name = String(owner_name).trim()
      if (phone != null) updates.phone = phone ? String(phone).trim() : null
      if (whatsapp != null) updates.whatsapp = whatsapp ? String(whatsapp).trim() : null
      if (address != null) updates.address = address ? String(address).trim() : null
      if (city != null) updates.city = city ? String(city).trim() : null
      if (area != null) updates.area = area ? String(area).trim() : null
      if (opening_time != null) updates.opening_time = opening_time !== '' ? String(opening_time) : null
      if (closing_time != null) updates.closing_time = closing_time !== '' ? String(closing_time) : null

      const { error } = await client.from('laundry_shops').update(updates).eq('id', id).eq('owner_email', email)

      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ message: 'Invalid shopType' }, { status: 400 })
  } catch (e) {
    console.error('Vendor my-store PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** PATCH /api/vendor/my-store — toggle shop open/closed (Active / Away) */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const { id, shopType, is_open } = body

    if (!id || !shopType || typeof is_open !== 'boolean') {
      return NextResponse.json({ message: 'Missing id, shopType, or is_open' }, { status: 400 })
    }

    const client = await createClient()

    if (shopType === 'food') {
      const { data: stall } = await client.from('food_stalls').select('id').eq('id', id).eq('owner_email', email).single()
      if (!stall) return NextResponse.json({ message: 'Store not found or not yours' }, { status: 404 })
      const { error } = await client.from('food_stalls').update({ is_open }).eq('id', id).eq('owner_email', email)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, is_open })
    }

    if (shopType === 'laundry') {
      const { data: shop } = await client.from('laundry_shops').select('id').eq('id', id).eq('owner_email', email).single()
      if (!shop) return NextResponse.json({ message: 'Store not found or not yours' }, { status: 404 })
      const { error } = await client.from('laundry_shops').update({ is_open }).eq('id', id).eq('owner_email', email)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, is_open })
    }

    return NextResponse.json({ message: 'Invalid shopType' }, { status: 400 })
  } catch (e) {
    console.error('Vendor my-store PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
