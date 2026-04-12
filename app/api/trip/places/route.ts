import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/trip/places?location=lat,lng
 * Fetch tourist attractions near the given location using Google Places API.
 * Tries Places API (New) first, then falls back to classic Nearby Search.
 */

function buildPlaceDescription(name: string, address: string | null) {
  const safeName = name?.trim()
  if (!safeName) return 'A great tourist attraction nearby.'
  if (!address?.trim()) return `Enjoy ${safeName}. Local highlights and flexible exploration nearby.`

  // Google addresses usually look like: "Area, City, Country". Keep it clean and not too long.
  const area = address.split(',').slice(0, 2).join(',').trim()
  if (!area) return `Enjoy ${safeName}. Local highlights and flexible exploration nearby.`

  return `Enjoy ${safeName} near ${area}. Explore local highlights at your own pace.`
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { message: 'GOOGLE_MAPS_API_KEY is not configured' },
      { status: 503 }
    )
  }

  const location = request.nextUrl.searchParams.get('location')?.trim()
  if (!location) {
    return NextResponse.json(
      { message: 'Missing query: location=lat,lng' },
      { status: 400 }
    )
  }

  const [latStr, lngStr] = location.split(',').map((s) => s.trim())
  const lat = parseFloat(latStr)
  const lng = parseFloat(lngStr)
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { message: 'Invalid location. Use location=lat,lng (e.g. 12.97,77.59)' },
      { status: 400 }
    )
  }

  try {
    // 1) Places API (New) - searchNearby
    const newUrl = 'https://places.googleapis.com/v1/places:searchNearby'
    const newBody = {
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 50000, // 50km
        },
      },
      includedTypes: ['tourist_attraction'],
      maxResultCount: 20,
    }

    const newRes = await fetch(newUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.location,places.rating,places.photos,places.formattedAddress',
      },
      body: JSON.stringify(newBody),
      cache: 'no-store',
    })

    const newText = await newRes.text()
    if (newRes.ok) {
      const data = JSON.parse(newText) as {
        places?: Array<{
          id?: string
          displayName?: { text?: string }
          location?: { latitude?: number; longitude?: number }
          rating?: number
          formattedAddress?: string
          photos?: Array<{ name?: string }>
        }>
      }

      const places = (data.places || []).map((p) => {
        const photoName = p.photos?.[0]?.name
        const imageUrl =
          photoName && apiKey
            ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`
            : null
        return {
          id: p.id ?? null,
          name: p.displayName?.text ?? 'Unnamed place',
          rating: p.rating ?? null,
          latitude: p.location?.latitude ?? null,
          longitude: p.location?.longitude ?? null,
          address: p.formattedAddress ?? null,
          imageUrl,
          description: buildPlaceDescription(p.displayName?.text ?? 'Unnamed place', p.formattedAddress ?? null),
        }
      })

      return NextResponse.json(places, { status: 200 })
    }

    console.error('Places API (New) error:', newRes.status, newText)

    // 2) Fallback: classic Places Nearby Search
    const params = new URLSearchParams({
      key: apiKey,
      location: `${lat},${lng}`,
      radius: '50000',
      type: 'tourist_attraction',
    })
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`
    const legacyRes = await fetch(legacyUrl, { cache: 'no-store' })
    const legacyText = await legacyRes.text()
    if (!legacyRes.ok) {
      console.error('Places Nearby Search error:', legacyRes.status, legacyText)
      return NextResponse.json(
        {
          message: `Places API error: ${newRes.status} (new), ${legacyRes.status} (legacy). Check Billing + key restrictions.`,
        },
        { status: 502 }
      )
    }

    const legacyData = JSON.parse(legacyText) as {
      status?: string
      error_message?: string
      results?: Array<{
        place_id?: string
        name?: string
        rating?: number
        vicinity?: string
        geometry?: { location?: { lat?: number; lng?: number } }
        photos?: Array<{ photo_reference?: string }>
      }>
    }

    if (legacyData.status !== 'OK' && legacyData.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { message: legacyData.error_message || `Places Nearby error: ${legacyData.status}` },
        { status: 502 }
      )
    }

    const places = (legacyData.results || []).slice(0, 20).map((p) => {
      const photoRef = p.photos?.[0]?.photo_reference
      const imageUrl = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${encodeURIComponent(photoRef)}&key=${apiKey}`
        : null
      return {
        id: p.place_id ?? null,
        name: p.name ?? 'Unnamed place',
        rating: p.rating ?? null,
        latitude: p.geometry?.location?.lat ?? null,
        longitude: p.geometry?.location?.lng ?? null,
        address: p.vicinity ?? null,
        imageUrl,
        description: buildPlaceDescription(p.name ?? 'Unnamed place', p.vicinity ?? null),
      }
    })

    return NextResponse.json(places, { status: 200 })
  } catch (e) {
    console.error('Trip places error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Failed to fetch places' },
      { status: 500 }
    )
  }
}
