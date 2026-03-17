import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/trip/[id]
 * Fetch a single trip with places. User must own the trip.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id || user.id < 1) {
      return NextResponse.json({ message: 'Sign in to view trip' }, { status: 401 })
    }

    const { id } = await context.params
    const tripId = parseInt(id, 10)
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ message: 'Invalid trip ID' }, { status: 400 })
    }

    const client = await createClient()
    const { data, error } = await client
      .from('trips')
      .select('*, trip_places(*)')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('GET /api/trip/[id] error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
