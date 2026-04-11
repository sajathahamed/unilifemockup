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

/**
 * PATCH /api/trip/[id]
 * Replace trip details, optional plan_json and places list (full replace of places when `places` is sent).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id || user.id < 1) {
      return NextResponse.json({ message: 'Sign in to update trip' }, { status: 401 })
    }

    const { id } = await context.params
    const tripId = parseInt(id, 10)
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ message: 'Invalid trip ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const {
      start_location,
      destination,
      days = 1,
      travelers = 1,
      hotel_budget_per_night = 0,
      food_budget_per_day = 0,
      transport_cost_per_km = 0,
      total_budget = 0,
      distance_km,
      places,
      plan_json,
    } = body

    if (start_location == null || destination == null) {
      return NextResponse.json(
        { message: 'start_location and destination are required' },
        { status: 400 }
      )
    }

    const client = await createClient()

    const { data: existing, error: exErr } = await client
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 })
    }

    const updateRow: Record<string, unknown> = {
      start_location: String(start_location).trim(),
      destination: String(destination).trim(),
      days: Math.max(1, Number(days)),
      duration: Math.max(1, Number(days)),
      travelers: Math.max(1, Number(travelers)),
      hotel_budget_per_night: Number(hotel_budget_per_night) || 0,
      food_budget_per_day: Number(food_budget_per_day) || 0,
      transport_cost_per_km: Number(transport_cost_per_km) || 0,
      total_budget: Number(total_budget) || 0,
      budget: Number(total_budget) || 0,
      distance_km: distance_km != null ? Number(distance_km) : null,
    }

    if (plan_json !== undefined) {
      updateRow.plan_json = plan_json && typeof plan_json === 'object' ? plan_json : null
    }

    const { error: upErr } = await client
      .from('trips')
      .update(updateRow)
      .eq('id', tripId)
      .eq('user_id', user.id)

    if (upErr) {
      console.error('Trip PATCH error:', upErr)
      return NextResponse.json({ message: upErr.message || 'Failed to update trip' }, { status: 400 })
    }

    if (Array.isArray(places)) {
      await client.from('trip_places').delete().eq('trip_id', tripId)
      if (places.length > 0) {
        const rows = places.map(
          (p: {
            place_name: string
            rating?: number
            latitude?: number
            longitude?: number
            place_id?: string
            image_url?: string
          }) => ({
            trip_id: tripId,
            place_name: String(p.place_name ?? '').trim() || 'Unnamed',
            rating: p.rating != null ? Number(p.rating) : null,
            latitude: p.latitude != null ? Number(p.latitude) : null,
            longitude: p.longitude != null ? Number(p.longitude) : null,
            place_id: p.place_id ?? null,
            image_url: p.image_url ?? null,
          })
        )
        const { error: pErr } = await client.from('trip_places').insert(rows)
        if (pErr) {
          return NextResponse.json({ message: pErr.message }, { status: 400 })
        }
      }
    }

    const { data: fullTrip } = await client
      .from('trips')
      .select('*, trip_places(*)')
      .eq('id', tripId)
      .single()

    return NextResponse.json(fullTrip ?? { ok: true }, { status: 200 })
  } catch (e) {
    console.error('PATCH /api/trip/[id] error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/trip/[id]
 * Remove trip (trip_places cascade). Owner only.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id || user.id < 1) {
      return NextResponse.json({ message: 'Sign in to delete trip' }, { status: 401 })
    }

    const { id } = await context.params
    const tripId = parseInt(id, 10)
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ message: 'Invalid trip ID' }, { status: 400 })
    }

    const client = await createClient()
    const { data: row, error: selErr } = await client
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (selErr) {
      console.error('Trip DELETE select:', selErr)
      return NextResponse.json({ message: selErr.message || 'Failed to delete trip' }, { status: 400 })
    }
    if (!row) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 })
    }

    const { error: delErr } = await client.from('trips').delete().eq('id', tripId).eq('user_id', user.id)

    if (delErr) {
      console.error('Trip DELETE error:', delErr)
      return NextResponse.json({ message: delErr.message || 'Failed to delete trip' }, { status: 400 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error('DELETE /api/trip/[id] error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
