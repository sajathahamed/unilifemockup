import { NextRequest, NextResponse } from 'next/server'
import { getGooglePlacesApiKey } from '@/lib/env'

async function fetchLaundryFromGoogle(lat: string, lng: string) {
    const apiKey = getGooglePlacesApiKey()
    if (!apiKey) return { results: [], error: 'Google API Key missing' }

    // Using Google Places API (New) - Search Nearby
    const url = 'https://places.googleapis.com/v1/places:searchNearby'
    const body = {
        includedTypes: ['laundry'],
        maxResultCount: 15,
        locationRestriction: {
            circle: {
                center: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng)
                },
                radius: 5000.0
            }
        }
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.photos'
            },
            body: JSON.stringify(body)
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error?.message || `Google API failed with status ${res.status}`)
        }

        const data = await res.json()
        const results = (data.places || []).map((p: any) => {
            // Construct photo URL if available
            let imageUrl = 'https://images.unsplash.com/photo-1545173168-9f1947eeba01?w=800&q=80'
            if (p.photos && p.photos.length > 0) {
                const photoName = p.photos[0].name
                imageUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`
            }

            // Dynamic pricing based on name hash or rating (consistent for same shop)
            const basePrice = 220
            const variance = (p.displayName?.text.length % 5) * 20
            const finalPrice = basePrice + variance

            return {
                id: `google-${p.id}`,
                name: p.displayName?.text || 'Laundry Service',
                image: imageUrl,
                pricePerKg: finalPrice,
                contact: p.nationalPhoneNumber || 'Contact via Google',
                address: p.formattedAddress || 'Nearby',
                rating: p.rating || 4.2,
                source: 'google'
            }
        })

        return { results, error: null }
    } catch (err: any) {
        return { results: [], error: err.message }
    }
}

async function fetchLaundryFromOverpass(lat: string, lng: string) {
    const query = `
    [out:json][timeout:25];
    (
      node["amenity"="laundry"](around:5000,${lat},${lng});
      way["amenity"="laundry"](around:5000,${lat},${lng});
      node["shop"="laundry"](around:5000,${lat},${lng});
      way["shop"="laundry"](around:5000,${lat},${lng});
    );
    out center;
    `
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

    try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Overpass API failed with status ${res.status}`)
        const data = await res.json()
        const results = (data.elements || []).map((el: any) => {
            const tags = el.tags || {}
            const name = tags.name || 'Local Laundry'

            // Dynamic pricing based on name hash (consistent for same shop)
            const basePrice = 200
            const variance = (name.length % 5) * 20
            const finalPrice = basePrice + variance

            return {
                id: `osm-${el.id}`,
                name: name,
                image: 'https://images.unsplash.com/photo-1545173168-9f1947eeba01?w=800&q=80',
                pricePerKg: finalPrice,
                contact: tags.phone || tags['contact:phone'] || 'Contact at shop',
                address: tags['addr:street'] || tags['addr:full'] || 'Nearby',
                rating: 4.2 + (Math.random() * 0.5),
                source: 'osm'
            }
        })
        return { results, error: null }
    } catch (err: any) {
        return { results: [], error: err.message }
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const id = searchParams.get('id')

    // If ID is provided, try to find that specific vendor
    if (id) {
        // We use Jaffna as the search anchor to find the vendor from either source
        const searchLat = '9.6615'
        const searchLng = '80.0255'
        const [google, osm] = await Promise.all([
            fetchLaundryFromGoogle(searchLat, searchLng),
            fetchLaundryFromOverpass(searchLat, searchLng)
        ])
        const all = [...google.results, ...osm.results]
        const found = all.find((v: any) => v.id === id)

        if (found) {
            return NextResponse.json({ result: found, source: 'single' })
        }
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    let finalLat = lat
    let finalLng = lng

    if (!finalLat || !finalLng) {
        // Default to Jaffna area if location is not provided
        finalLat = '9.6615'
        finalLng = '80.0255'
    }

    // Try Google first, then OSM
    const google = await fetchLaundryFromGoogle(finalLat, finalLng)

    // If Google returns results, we can still fetch OSM to augment if results are few
    let finalResults = google.results

    if (finalResults.length < 5) {
        const osm = await fetchLaundryFromOverpass(finalLat as string, finalLng as string)
        // Merge avoiding duplicates by name
        osm.results.forEach((osmShop: any) => {
            if (!finalResults.some((gShop: any) => gShop.name.toLowerCase() === osmShop.name.toLowerCase())) {
                finalResults.push(osmShop)
            }
        })
    }

    return NextResponse.json({
        results: finalResults,
        source: finalResults.some((r: any) => r.source === 'google') ? 'google' : 'osm',
        google_error: google.error
    })
}
