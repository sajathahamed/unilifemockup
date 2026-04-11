import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/trip/geocode?address=...
 * Convert address/place name to lat,lng using Google Geocoding API.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { message: 'GOOGLE_MAPS_API_KEY is not configured' },
      { status: 503 }
    )
  }

  const address = request.nextUrl.searchParams.get('address')?.trim()
  if (!address) {
    return NextResponse.json(
      { message: 'Missing query: address=...' },
      { status: 400 }
    )
  }

  try {
    const params = new URLSearchParams({ address, key: apiKey })
    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ message: 'Geocoding failed' }, { status: 502 })

    const data = (await res.json()) as {
      status: string
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } }; formatted_address?: string }>
    }
    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json(
        { message: 'Address not found or invalid' },
        { status: 404 }
      )
    }

    const loc = data.results[0].geometry?.location
    const formatted = data.results[0].formatted_address
    if (!loc) return NextResponse.json({ message: 'No coordinates found' }, { status: 404 })

    return NextResponse.json(
      { lat: loc.lat, lng: loc.lng, formattedAddress: formatted ?? address },
      { status: 200 }
    )
  } catch (e) {
    console.error('Geocode error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Geocoding failed' },
      { status: 500 }
    )
  }
}
