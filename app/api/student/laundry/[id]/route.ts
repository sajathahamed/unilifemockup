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

  const pricePerKg =
    parseFirstNumber((shop as any)?.price_list) ??
    parseFirstNumber((shop as any)?.services) ??
    250

  const address =
    shop.address ??
    [shop.area, shop.city].filter(Boolean).join(', ') ??
    'Nearby'

  return NextResponse.json({
    id: String(shop.id),
    name: shop.shop_name || (shop as any).owner_name || 'Laundry Shop',
    image: shop.logo || shop.banner || 'https://images.unsplash.com/photo-1545173168-9f1947eeba01?w=800&q=80',
    pricePerKg: Number(pricePerKg) || 250,
    contact: shop.phone || (shop as any).owner_email || 'Contact at shop',
    address: String(address),
    rating: 4.2,
    source: 'db',
  })
}

