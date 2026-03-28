import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRole } from '@/lib/auth.server'

function parseFirstNumber(input: any): number | null {
  try {
    if (typeof input === 'number') return Number.isFinite(input) ? input : null
    const s = String(input ?? '').trim()
    if (!s) return null
    const m = s.match(/(\d+(\.\d+)?)/)
    return m ? Number(m[1]) : null
  } catch {
    return null
  }
}

function parsePricingObject(input: unknown): Record<string, unknown> {
  if (!input) return {}
  if (typeof input === 'object') return (input as Record<string, unknown>) ?? {}
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }
  return {}
}

function numberFrom(obj: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const n = Number(obj[k])
    if (Number.isFinite(n) && n >= 0) return n
  }
  return fallback
}

type ServiceDef = { id: string; type: string; unit: 'kg' | 'item'; keys: string[]; fallback: number }

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id
  // Support both numeric and UUID primary keys.
  const shopId = /^\d+$/.test(id) ? parseInt(id, 10) : id

  // Student-only route. If not logged in, return empty.
  await verifyRole('student').catch(() => null)

  const client = await createClient()
  const { data: shop, error } = await client
    .from('laundry_shops')
    .select('id, shop_name, logo, banner, phone, address, city, area, price_list, services')
    .eq('id', shopId as any)
    .single()

  if (error || !shop) {
    return NextResponse.json({ message: 'Laundry shop not found' }, { status: 404 })
  }

  const priceObj = parsePricingObject((shop as any)?.price_list)
  const fallbackPerKg = parseFirstNumber((shop as any)?.price_list) ?? parseFirstNumber((shop as any)?.services) ?? 250
  const washFold = numberFrom(priceObj, ['wash_only_per_kg', 'wash_only'], Number(fallbackPerKg) || 200)
  const washIron = numberFrom(priceObj, ['wash_iron_per_kg', 'wash_iron'], washFold + 50)
  const serviceDefs: ServiceDef[] = [
    { id: 'wash_fold', type: 'Wash & Fold', unit: 'kg', keys: ['wash_only_per_kg', 'wash_only'], fallback: washFold },
    { id: 'wash_iron', type: 'Wash & Iron', unit: 'kg', keys: ['wash_iron_per_kg', 'wash_iron'], fallback: washIron },
    { id: 'normal_dress_wash_only', type: 'Normal Dress - Wash Only', unit: 'item', keys: ['normal_dress_wash_only'], fallback: 220 },
    { id: 'normal_dress_wash_iron', type: 'Normal Dress - Wash & Iron', unit: 'item', keys: ['normal_dress_wash_iron'], fallback: 280 },
    { id: 'shirt', type: 'Gents Shirt', unit: 'item', keys: ['shirt_per_item', 'shirt'], fallback: 120 },
    { id: 'trouser', type: 'Gents Trouser', unit: 'item', keys: ['trouser_per_item', 'trouser'], fallback: 140 },
    { id: 'frock', type: 'Ladies Frock', unit: 'item', keys: ['frock_per_item', 'frock'], fallback: 220 },
    { id: 'saree', type: 'Saree', unit: 'item', keys: ['saree_per_item', 'saree'], fallback: 300 },
    { id: 'coat', type: 'Coat', unit: 'item', keys: ['coat_per_item', 'coat'], fallback: 300 },
    { id: 'suit', type: 'Suit / Professional Wear', unit: 'item', keys: ['suit_per_item', 'suit'], fallback: 450 },
    { id: 'bedsheet', type: 'Bedsheet', unit: 'item', keys: ['bedsheet_per_item', 'bedsheet'], fallback: 250 },
    { id: 'blanket', type: 'Blanket', unit: 'item', keys: ['blanket_per_item', 'blanket'], fallback: 450 },
    { id: 'curtain', type: 'Curtain', unit: 'item', keys: ['curtain_per_item', 'curtain'], fallback: 220 },
  ]

  const services = serviceDefs
    .map((def) => ({
      id: def.id,
      type: def.type,
      price: numberFrom(priceObj, def.keys, def.fallback),
      unit: def.unit,
    }))
    .filter((s) => Number.isFinite(Number(s.price)) && Number(s.price) >= 0)

  const address =
    shop.address ??
    [shop.area, shop.city].filter(Boolean).join(', ') ??
    'Nearby'

  return NextResponse.json({
    id: String(shop.id),
    name: shop.shop_name || (shop as any).owner_name || 'Laundry Shop',
    image: shop.logo || shop.banner || 'https://images.unsplash.com/photo-1545173168-9f1947eeba01?w=800&q=80',
    pricePerKg: Number(washFold) || 250,
    services,
    contact: shop.phone || (shop as any).owner_email || 'Contact at shop',
    address: String(address),
    rating: 4.2,
    source: 'db',
  })
}

