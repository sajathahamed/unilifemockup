import { NextRequest, NextResponse } from 'next/server'

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

async function geocodeAddress(apiKey: string, address: string) {
  const params = new URLSearchParams({ address, key: apiKey })
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`)
  const data = (await res.json()) as {
    status: string
    results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>
    error_message?: string
  }
  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(data.error_message || `Geocoding error: ${data.status}`)
  }
  const loc = data.results[0].geometry?.location
  if (!loc) throw new Error('No coordinates found')
  return { lat: loc.lat, lng: loc.lng }
}

/**
 * GET /api/trip/distance?origins=...&destinations=...
 * Uses Google Routes API (New) to get travel distance (km) and duration.
 * origins and destinations can be lat,lng or place names/addresses.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { message: 'GOOGLE_MAPS_API_KEY is not configured' },
      { status: 503 }
    )
  }

  const origins = request.nextUrl.searchParams.get('origins')?.trim()
  const destinations = request.nextUrl.searchParams.get('destinations')?.trim()
  if (!origins || !destinations) {
    return NextResponse.json(
      { message: 'Missing query: origins=...&destinations=...' },
      { status: 400 }
    )
  }

  try {
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Only request what we need.
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
      },
      body: JSON.stringify({
        origin: { address: origins },
        destination: { address: destinations },
        travelMode: 'DRIVE',
        units: 'METRIC',
        computeAlternativeRoutes: false,
      }),
      cache: 'no-store',
    })

    const jsonText = await res.text()
    if (!res.ok) {
      console.error('Routes API error:', res.status, jsonText)

      // Fallback: if Routes API is blocked (common 403), return straight-line distance
      // using Geocoding API so the UI can still function with Places+Geocoding enabled.
      if (res.status === 403) {
        try {
          const [o, d] = await Promise.all([
            geocodeAddress(apiKey, origins),
            geocodeAddress(apiKey, destinations),
          ])
          const distanceKm = Math.round(haversineKm(o, d) * 100) / 100
          return NextResponse.json(
            {
              distanceKm,
              distanceText: `${distanceKm} km`,
              durationSeconds: 0,
              durationText: null,
              approximate: true,
              note: 'Routes API denied (403). Returned straight-line distance via Geocoding API.',
            },
            { status: 200 }
          )
        } catch (fallbackErr) {
          const hint =
            'Enable Routes API + Billing, or relax API key restrictions. Geocoding fallback also failed.'
          return NextResponse.json(
            {
              message: `Routes API error: ${res.status}`,
              hint,
              details: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
            },
            { status: 502 }
          )
        }
      }

      const hint =
        res.status === 403
          ? ' Enable Routes API, enable Billing, and ensure API key restrictions allow server-side requests.'
          : undefined
      return NextResponse.json({ message: `Routes API error: ${res.status}`, hint }, { status: 502 })
    }

    const data = JSON.parse(jsonText) as {
      routes?: Array<{
        distanceMeters?: number
        duration?: string // e.g. "123s"
      }>
    }

    const route = data.routes?.[0]
    if (!route) {
      return NextResponse.json(
        { message: 'Could not compute route for the given origins/destinations' },
        { status: 400 }
      )
    }

    const distanceMeters = route.distanceMeters ?? 0
    const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100

    const durationSeconds = (() => {
      const s = route.duration ?? ''
      const m = /^(\d+)s$/.exec(s)
      return m ? Number(m[1]) : 0
    })()

    return NextResponse.json(
      {
        distanceKm,
        distanceText: `${distanceKm} km`,
        durationSeconds,
        durationText: durationSeconds ? `${Math.round(durationSeconds / 60)} min` : null,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('Trip distance error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Failed to fetch distance' },
      { status: 500 }
    )
  }
}
