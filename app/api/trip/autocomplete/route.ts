import { NextRequest, NextResponse } from 'next/server'

type AutocompleteSuggestion = {
  placeId: string
  description: string
}

const SRI_LANKA_PLACE_FALLBACKS = [
  'Colombo, Sri Lanka',
  'Kandy, Sri Lanka',
  'Galle, Sri Lanka',
  'Jaffna, Sri Lanka',
  'Negombo, Sri Lanka',
  'Nuwara Eliya, Sri Lanka',
  'Ella, Sri Lanka',
  'Anuradhapura, Sri Lanka',
  'Trincomalee, Sri Lanka',
  'Batticaloa, Sri Lanka',
]

function getPlacesApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ??
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY ??
    ''
  )
}

function localFallbackSuggestions(input: string): AutocompleteSuggestion[] {
  const q = input.trim().toLowerCase()
  if (!q) return []

  return SRI_LANKA_PLACE_FALLBACKS
    .filter((p) => p.toLowerCase().includes(q))
    .slice(0, 8)
    .map((description) => ({
      placeId: `local-${description.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      description,
    }))
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
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
  const apiKey = getPlacesApiKey()
  if (!apiKey) {
    const input = request.nextUrl.searchParams.get('input')?.trim() ?? ''
    return NextResponse.json(localFallbackSuggestions(input), { status: 200 })
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
      const data = tryParseJson<{
        suggestions?: Array<{
          placePrediction?: {
            placeId?: string
            text?: { text?: string }
          }
        }>
      }>(newJsonText)

      if (!data) {
        console.error('Places (New) autocomplete returned invalid JSON')
        return NextResponse.json(localFallbackSuggestions(input), { status: 200 })
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
      return NextResponse.json(localFallbackSuggestions(input), { status: 200 })
    }

    const legacyData = tryParseJson<{
      status?: string
      error_message?: string
      predictions?: Array<{ place_id?: string; description?: string }>
    }>(legacyText)

    if (!legacyData) {
      console.error('Places legacy autocomplete returned invalid JSON')
      return NextResponse.json(localFallbackSuggestions(input), { status: 200 })
    }

    if (legacyData.status !== 'OK' && legacyData.status !== 'ZERO_RESULTS') {
      console.error('Places legacy autocomplete non-OK status:', legacyData.status, legacyData.error_message)
      return NextResponse.json(localFallbackSuggestions(input), { status: 200 })
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

