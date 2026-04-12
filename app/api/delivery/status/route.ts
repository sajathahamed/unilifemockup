import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/delivery/status — Get the current delivery admin's online/offline status.
 */
export async function GET() {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { data } = await client
      .from('delivery_agents')
      .select('is_available')
      .eq('id', user.id)
      .maybeSingle()

    // Default to online if no record exists yet
    return NextResponse.json({ is_online: data?.is_available ?? true })
  } catch (e) {
    console.error('Delivery status GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/delivery/status — Toggle the current delivery admin's online/offline status.
 * Body: { is_online: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { is_online } = body

    if (typeof is_online !== 'boolean') {
      return NextResponse.json({ message: 'is_online must be a boolean' }, { status: 400 })
    }

    const client = await createClient()

    // Upsert to handle case where delivery_agents row doesn't exist yet
    const { error } = await client.from('delivery_agents').upsert({
      id: user.id,
      is_available: is_online,
    })

    if (error) {
      console.error('Delivery status update error:', error)
      return NextResponse.json({ message: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({
      is_online,
      message: is_online ? 'You are now online' : 'You are now offline',
    })
  } catch (e) {
    console.error('Delivery status POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
