import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

type PricingPayload = {
  wash_only_per_kg: number
  wash_iron_per_kg: number
  normal_dress_wash_only: number
  normal_dress_wash_iron: number
  shirt_per_item: number
  trouser_per_item: number
  frock_per_item: number
  saree_per_item: number
  coat_per_item: number
  suit_per_item: number
  bedsheet_per_item: number
  blanket_per_item: number
  curtain_per_item: number
  pickup_available: boolean
}

function parsePricing(raw: unknown): PricingPayload {
  if (typeof raw !== 'string' || !raw.trim()) {
    return {
      wash_only_per_kg: 200,
      wash_iron_per_kg: 250,
      normal_dress_wash_only: 220,
      normal_dress_wash_iron: 280,
      shirt_per_item: 120,
      trouser_per_item: 140,
      frock_per_item: 220,
      saree_per_item: 300,
      coat_per_item: 300,
      suit_per_item: 450,
      bedsheet_per_item: 250,
      blanket_per_item: 450,
      curtain_per_item: 220,
      pickup_available: true,
    }
  }
  try {
    const j = JSON.parse(raw)
    return {
      wash_only_per_kg: Number(j?.wash_only_per_kg ?? 200),
      wash_iron_per_kg: Number(j?.wash_iron_per_kg ?? 250),
      normal_dress_wash_only: Number(j?.normal_dress_wash_only ?? 220),
      normal_dress_wash_iron: Number(j?.normal_dress_wash_iron ?? 280),
      shirt_per_item: Number(j?.shirt_per_item ?? 120),
      trouser_per_item: Number(j?.trouser_per_item ?? 140),
      frock_per_item: Number(j?.frock_per_item ?? 220),
      saree_per_item: Number(j?.saree_per_item ?? 300),
      coat_per_item: Number(j?.coat_per_item ?? 300),
      suit_per_item: Number(j?.suit_per_item ?? 450),
      bedsheet_per_item: Number(j?.bedsheet_per_item ?? 250),
      blanket_per_item: Number(j?.blanket_per_item ?? 450),
      curtain_per_item: Number(j?.curtain_per_item ?? 220),
      pickup_available: Boolean(j?.pickup_available ?? true),
    }
  } catch {
    return {
      wash_only_per_kg: 200,
      wash_iron_per_kg: 250,
      normal_dress_wash_only: 220,
      normal_dress_wash_iron: 280,
      shirt_per_item: 120,
      trouser_per_item: 140,
      frock_per_item: 220,
      saree_per_item: 300,
      coat_per_item: 300,
      suit_per_item: 450,
      bedsheet_per_item: 250,
      blanket_per_item: 450,
      curtain_per_item: 220,
      pickup_available: true,
    }
  }
}

/** GET /api/vendor/laundry-pricing — pricing config for current vendor's laundry shop */
export async function GET() {
  try {
    const user = await verifyRole('vendor-laundry')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const client = await createClient()
    const { data: shop, error } = await client
      .from('laundry_shops')
      .select('id, shop_name, price_list, services, pickup_delivery')
      .eq('owner_email', email)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    if (!shop) return NextResponse.json({ message: 'Laundry shop not found' }, { status: 404 })

    const pricing = parsePricing((shop as any).price_list ?? (shop as any).services)
    return NextResponse.json({
      shop_id: shop.id,
      shop_name: shop.shop_name,
      pricing: {
        ...pricing,
        pickup_available: Boolean((shop as any).pickup_delivery ?? pricing.pickup_available),
      },
    })
  } catch (e) {
    console.error('Vendor laundry-pricing GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/vendor/laundry-pricing — update pricing config */
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyRole('vendor-laundry')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ message: 'No email' }, { status: 400 })

    const body = await request.json()
    const pricing: PricingPayload = {
      wash_only_per_kg: Math.max(0, Number(body?.wash_only_per_kg ?? 0)),
      wash_iron_per_kg: Math.max(0, Number(body?.wash_iron_per_kg ?? 0)),
      normal_dress_wash_only: Math.max(0, Number(body?.normal_dress_wash_only ?? 0)),
      normal_dress_wash_iron: Math.max(0, Number(body?.normal_dress_wash_iron ?? 0)),
      shirt_per_item: Math.max(0, Number(body?.shirt_per_item ?? 0)),
      trouser_per_item: Math.max(0, Number(body?.trouser_per_item ?? 0)),
      frock_per_item: Math.max(0, Number(body?.frock_per_item ?? 0)),
      saree_per_item: Math.max(0, Number(body?.saree_per_item ?? 0)),
      coat_per_item: Math.max(0, Number(body?.coat_per_item ?? 0)),
      suit_per_item: Math.max(0, Number(body?.suit_per_item ?? 0)),
      bedsheet_per_item: Math.max(0, Number(body?.bedsheet_per_item ?? 0)),
      blanket_per_item: Math.max(0, Number(body?.blanket_per_item ?? 0)),
      curtain_per_item: Math.max(0, Number(body?.curtain_per_item ?? 0)),
      pickup_available: Boolean(body?.pickup_available),
    }

    const client = await createClient()
    const { data: shop } = await client
      .from('laundry_shops')
      .select('id')
      .eq('owner_email', email)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (!shop) return NextResponse.json({ message: 'Laundry shop not found' }, { status: 404 })

    const { error } = await client
      .from('laundry_shops')
      .update({
        price_list: JSON.stringify(pricing),
        // `services` is text[] in DB, so store labels instead of JSON object text.
        services: [
          'wash_only',
          'wash_iron',
          'normal_dress_wash_only',
          'normal_dress_wash_iron',
          'shirt',
          'trouser',
          'frock',
          'saree',
          'coat',
          'suit',
          'bedsheet',
          'blanket',
          'curtain',
        ],
        pickup_delivery: pricing.pickup_available,
      })
      .eq('id', shop.id)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, pricing })
  } catch (e) {
    console.error('Vendor laundry-pricing PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

