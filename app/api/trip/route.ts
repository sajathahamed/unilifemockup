import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { sendDialogSms } from '@/lib/dialog-sms.server'

/**
 * POST /api/trip
 * Save a new trip (and optionally trip_places). Requires auth.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id || user.id < 1) {
      return NextResponse.json({ message: 'Sign in to save a trip' }, { status: 401 })
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
      places = [],
      plan_json = null,
    } = body

    if (!start_location || !destination) {
      return NextResponse.json(
        { message: 'start_location and destination are required' },
        { status: 400 }
      )
    }

    const client = await createClient()
    const { data: trip, error: tripError } = await client
      .from('trips')
      .insert({
        user_id: user.id,
        start_location: String(start_location).trim(),
        destination: String(destination).trim(),
        days: Math.max(1, Number(days)),
        duration: Math.max(1, Number(days)),   // same as days — satisfies NOT NULL constraint
        travelers: Math.max(1, Number(travelers)),
        hotel_budget_per_night: Number(hotel_budget_per_night) || 0,
        food_budget_per_day: Number(food_budget_per_day) || 0,
        transport_cost_per_km: Number(transport_cost_per_km) || 0,
        total_budget: Number(total_budget) || 0,
        budget: Number(total_budget) || 0,        // NOT NULL column in live DB
        distance_km: distance_km != null ? Number(distance_km) : null,
        plan_json: plan_json && typeof plan_json === 'object' ? plan_json : null,
      })
      .select()
      .single()


    if (tripError || !trip) {
      console.error('Trip insert error:', tripError)
      return NextResponse.json(
        { message: tripError?.message || 'Failed to save trip' },
        { status: 400 }
      )
    }

    const tripId = (trip as { id: number }).id
    if (Array.isArray(places) && places.length > 0) {
      const rows = places.map((p: { place_name: string; rating?: number; latitude?: number; longitude?: number; place_id?: string; image_url?: string }) => ({
        trip_id: tripId,
        place_name: String(p.place_name ?? '').trim() || 'Unnamed',
        rating: p.rating != null ? Number(p.rating) : null,
        latitude: p.latitude != null ? Number(p.latitude) : null,
        longitude: p.longitude != null ? Number(p.longitude) : null,
        place_id: p.place_id ?? null,
        image_url: p.image_url ?? null,
      }))
      await client.from('trip_places').insert(rows)
    }

    const { data: fullTrip } = await client
      .from('trips')
      .select('*, trip_places(*)')
      .eq('id', tripId)
      .single()

    // SMS Integration
    try {
      // 1. Get user phone number from student_phones table
      const { data: phoneData } = await client
        .from('student_phones')
        .select('mobile')
        .eq('user_id', user.id)
        .single()
      
      let mapUrl = ''
      if (plan_json && plan_json.dailyPlan) {
        const timeline = plan_json.dailyPlan.flatMap((d: any) => d.timeline || [])
        // Filter: Keep if has coordinates, OR if it's a fallback title that isn't totally generic
        const validPoints = timeline.filter((t: any) => {
          if (t.lat && t.lng) return true
          if (!t.title) return false
          const low = t.title.toLowerCase()
          return !low.includes('prepare') && !low.includes('departure') && !low.includes('check') && !low.includes('lunch') && !low.includes('dinner') && !low.includes('breakfast')
        })
        
        if (validPoints.length === 0) {
          mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination).replace(/%20/g, '+')}`
        } else {
          const getPos = (item: any) => {
            if (item.lat && item.lng) return `${item.lat},${item.lng}`
            return encodeURIComponent(item.title.replace(/^Visit\s+/i, '')).replace(/%20/g, '+')
          }
          const origin = getPos(validPoints[0])
          const dest = getPos(validPoints[validPoints.length - 1])
          const waypoints = validPoints.slice(1, -1).map(getPos).join('|')
          mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`
        }
      }

      const mobile = String(phoneData?.mobile ?? '').trim() || '94700000000'
      const msg = `Trip Planner: You have a new trip to ${destination} for ${days} days. Budget: Rs ${total_budget}. Route: ${mapUrl}`

      void sendDialogSms({
        number: mobile,
        text: msg,
        clientRef: `RPOSbyUpview_UniLife_trip_${tripId}`,
      }).then((result) => {
        if (!result.ok || result.gatewayReportedError) {
          const hint = result.gatewayErrorHint || JSON.stringify(result.body).slice(0, 200)
          console.warn('Trip SMS:', hint)
        }
      })
        
    } catch (smsError) {
      console.error('SMS Logic Error:', smsError)
    }

    return NextResponse.json(fullTrip ?? trip, { status: 201 })
  } catch (e) {
    console.error('POST /api/trip error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/trip
 * List trips for the current user. Requires auth.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id || user.id < 1) {
      return NextResponse.json({ message: 'Sign in to view trips' }, { status: 401 })
    }

    const client = await createClient()
    const { data, error } = await client
      .from('trips')
      .select('*, trip_places(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Trips list error:', error)
      return NextResponse.json(
        { message: error.message || 'Failed to fetch trips' },
        { status: 400 }
      )
    }

    return NextResponse.json(data ?? [], { status: 200 })
  } catch (e) {
    console.error('GET /api/trip error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
