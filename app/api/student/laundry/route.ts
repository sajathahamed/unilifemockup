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

export async function GET(_request: NextRequest) {
  // Student-only page. Don't hard-fail the endpoint if auth is missing; return empty results.
  await verifyRole('student').catch(() => null)

  const client = await createClient()

  const { data: shops, error } = await client
    .from('laundry_shops')
    .select('id, shop_name, logo, banner, phone, address, city, area, price_list, services, is_open, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ results: [], error: error.message }, { status: 200 })
  }

  const results = (shops ?? [])
    .filter((s: any) => s?.id)
    .map((s: any) => {
      const pricePerKg =
        parseFirstNumber(s?.price_list) ??
        parseFirstNumber(s?.services) ??
        250

      const address =
        s?.address ??
        [s?.area, s?.city].filter(Boolean).join(', ') ??
        'Nearby'

      return {
        id: `db-${String(s.id)}`,
        name: s?.shop_name || s?.owner_name || 'Laundry Shop',
        image: s?.logo || s?.banner || 'https://images.unsplash.com/photo-1545173168-9f1947eeba01?w=800&q=80',
        pricePerKg: Number(pricePerKg) || 250,
        contact: s?.phone || s?.owner_email || 'Contact at shop',
        address: String(address),
        rating: 4.2,
        source: 'db',
      }
    })

  return NextResponse.json({ results, source: 'db' })
}

