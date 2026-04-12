import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/vendor/shops — get food_stalls and laundry_shops owned by logged-in vendor (by email) */
export async function GET() {
  try {
    const user = await verifyRole('vendor')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const email = user.email?.toLowerCase()
    if (!email) return NextResponse.json({ food_stalls: [], laundry_shops: [] })

    const client = await createClient()
    const [foodRes, laundryRes] = await Promise.all([
      client.from('food_stalls').select('*').eq('owner_email', email),
      client.from('laundry_shops').select('*').eq('owner_email', email),
    ])

    return NextResponse.json({
      food_stalls: foodRes.data ?? [],
      laundry_shops: laundryRes.data ?? [],
    })
  } catch (e) {
    console.error('Vendor shops GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
