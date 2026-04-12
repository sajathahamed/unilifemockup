import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { isDeliveryServiceAvailable } from '@/lib/delivery-availability.server'

/**
 * GET /api/delivery/availability
 * Returns delivery availability for any authenticated user.
 */
export async function GET() {
  try {
    const user = await verifyAuth()
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const available = await isDeliveryServiceAvailable(client)
    return NextResponse.json({ available })
  } catch (e) {
    console.error('Delivery availability GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
