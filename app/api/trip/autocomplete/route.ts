import { NextRequest, NextResponse } from 'next/server'

type AutocompleteSuggestion = {
  placeId: string
  description: string
}

/**
 * GET /api/trip/autocomplete?input=...
 * Returns place suggestions (cities/places) for Trip Planner inputs.
 *
 * Tries Google Places API (New): places:autocomplete
 * Falls back to classic Places Autocomplete endpoint for compatibility.
 * Key remains server-side (GOOGLE_MAPS_API_KEY).
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ message: 'GOOGLE_MAPS_API_KEY is not configured' }, { status: 503 })
  }

  const input = request.nextUrl.searchParams.get('input')?.trim() ?? ''
  if (input.length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    // 1) Places API (New)
    const newUrl = 'https://places.googleapis.com/v1/places:autocomplete'
    const newRes = await fetch(newUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
      },
      body: JSON.stringify({
        input,
        // Keep it broad (users may type landmarks/stations).
        // If you want cities-only, we can further restrict the types.
      }),
      cache: 'no-store',
    })

    const newJsonText = await newRes.text()
    if (newRes.ok) {
      const data = JSON.parse(newJsonText) as {
        suggestions?: Array<{
          placePrediction?: {
            placeId?: string
            text?: { text?: string }
          }
        }>
      }

      const suggestions: AutocompleteSuggestion[] = (data.suggestions ?? [])
        .map((s) => ({
          placeId: s.placePrediction?.placeId ?? '',
          description: s.placePrediction?.text?.text ?? '',
        }))
        .filter((s) => s.placeId && s.description)
        .slice(0, 8)

      return NextResponse.json(suggestions, { status: 200 })
    }

    console.error('Places (New) autocomplete error:', newRes.status, newJsonText)

    // 2) Fallback: classic Places Autocomplete
    const params = new URLSearchParams({
      input,
      key: apiKey,
      // Prefer city-like suggestions, but still useful for stations/landmarks.
      // If you want ONLY cities, switch to types=(cities).
      types: 'geocode',
    })
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    const legacyRes = await fetch(legacyUrl, { cache: 'no-store' })
    const legacyText = await legacyRes.text()
    if (!legacyRes.ok) {
      console.error('Places legacy autocomplete error:', legacyRes.status, legacyText)
      return NextResponse.json(
        {
          message: `Autocomplete API error: ${newRes.status} (new), ${legacyRes.status} (legacy). Check Places API + Billing + key restrictions.`,
        },
        { status: 502 }
      )
    }

    const legacyData = JSON.parse(legacyText) as {
      status?: string
      error_message?: string
      predictions?: Array<{ place_id?: string; description?: string }>
    }
    if (legacyData.status !== 'OK' && legacyData.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { message: legacyData.error_message || `Places autocomplete error: ${legacyData.status}` },
        { status: 502 }
      )
    }

    const suggestions: AutocompleteSuggestion[] = (legacyData.predictions ?? [])
      .map((p) => ({ placeId: p.place_id ?? '', description: p.description ?? '' }))
      .filter((s) => s.placeId && s.description)
      .slice(0, 8)

    return NextResponse.json(suggestions, { status: 200 })
  } catch (e) {
    console.error('Trip autocomplete error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Failed to fetch autocomplete suggestions' },
      { status: 500 }
    )
  }
}

