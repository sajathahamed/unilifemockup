import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function logDebug(message: string) {
    const logPath = path.join(process.cwd(), 'debug_api.log')
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logPath, `${timestamp} - ${message}\n`)
}

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// Curated mock / demo data — always shown as fallback
const MOCK_SHOPS = [
    {
        place_id: 'mock-1',
        name: 'Campus Canteen Central',
        vicinity: '12 University Ave, Campus Block A',
        rating: 4.3,
        user_ratings_total: 342,
        price_level: 1,
        types: ['restaurant', 'food', 'canteen'],
        opening_hours: { open_now: true },
        photo_url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80',
        distance: '80m',
        tags: ['Canteen', 'Rice', 'Local'],
    },
    {
        place_id: 'mock-2',
        name: 'The Study Bites Cafe',
        vicinity: '5 Library Road, Near Main Gate',
        rating: 4.6,
        user_ratings_total: 189,
        price_level: 1,
        types: ['cafe', 'food', 'bakery'],
        opening_hours: { open_now: true },
        photo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
        distance: '150m',
        tags: ['Cafe', 'Sandwiches', 'Coffee'],
    },
    {
        place_id: 'mock-3',
        name: 'Mama Nasi Corner',
        vicinity: '3 Student Plaza, Block B',
        rating: 4.5,
        user_ratings_total: 567,
        price_level: 1,
        types: ['restaurant', 'food'],
        opening_hours: { open_now: false },
        photo_url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80',
        distance: '200m',
        tags: ['Rice', 'Asian', 'Halal'],
    },
    {
        place_id: 'mock-4',
        name: 'QuickBite Express',
        vicinity: '8 Sports Complex, Ground Floor',
        rating: 4.1,
        user_ratings_total: 254,
        price_level: 1,
        types: ['fast_food', 'food', 'restaurant'],
        opening_hours: { open_now: true },
        photo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
        distance: '320m',
        tags: ['Fast Food', 'Burgers', 'Wraps'],
    },
    {
        place_id: 'mock-5',
        name: 'FreshGreens Salad Bar',
        vicinity: '1 Health Sciences Building',
        rating: 4.7,
        user_ratings_total: 128,
        price_level: 2,
        types: ['restaurant', 'food', 'health'],
        opening_hours: { open_now: true },
        photo_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
        distance: '450m',
        tags: ['Healthy', 'Salads', 'Vegan'],
    },
    {
        place_id: 'mock-6',
        name: 'Roti House',
        vicinity: '22 Engineering Street',
        rating: 4.4,
        user_ratings_total: 403,
        price_level: 1,
        types: ['restaurant', 'food'],
        opening_hours: { open_now: true },
        photo_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
        distance: '520m',
        tags: ['Indian', 'Roti', 'Halal'],
    },
    {
        place_id: 'mock-7',
        name: 'Ice Bliss Desserts',
        vicinity: '9 Arts Faculty, Lower Ground',
        rating: 4.8,
        user_ratings_total: 231,
        price_level: 1,
        types: ['cafe', 'food', 'dessert'],
        opening_hours: { open_now: true },
        photo_url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&q=80',
        distance: '600m',
        tags: ['Desserts', 'Ice Cream', 'Drinks'],
    },
    {
        place_id: 'mock-8',
        name: 'The Noodle Stop',
        vicinity: '7 Science Tower, Level 1',
        rating: 4.2,
        user_ratings_total: 318,
        price_level: 1,
        types: ['restaurant', 'food', 'asian'],
        opening_hours: { open_now: false },
        photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        distance: '700m',
        tags: ['Noodles', 'Chinese', 'Soup'],
    },
]

// Helper: fetch one type from Google Places Nearby Search
async function fetchByType(lat: string, lng: string, type: string, key: string) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', '2000')
    url.searchParams.set('type', type)         // only ONE type per request
    url.searchParams.set('maxprice', '2')      // budget-friendly (0–2 of 4)
    url.searchParams.set('key', key)

    logDebug(`>>> Fetching ${type} near ${lat},${lng}...`)

    const res = await fetch(url.toString(), { cache: 'no-store' })
    const data = await res.json()

    if (!res.ok || data.status !== 'OK') {
        logDebug(`>>> Google API ${type} Error: HTTP ${res.status}, Google Status: ${data.status}, Message: ${data.error_message || 'N/A'}`)
        if (data.status === 'REQUEST_DENIED') {
            logDebug(`>>> REQUEST_DENIED details: ${JSON.stringify(data)}`)
        }
    } else {
        logDebug(`>>> Google API ${type} returned ${data.results?.length ?? 0} results`)
    }

    return data.results ?? []
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    logDebug(`>>> API /api/places CALLED: lat=${lat}, lng=${lng}`)

    // ── No API key → return mock immediately ──────────────────────────────────
    if (!GOOGLE_API_KEY) {
        logDebug('>>> [places] No API key configured — returning mock data')
        return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
    }

    // ── No coordinates → show mock (user must grant location) ────────────────
    if (!lat || !lng) {
        logDebug('>>> [places] No coordinates — returning mock data')
        return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
    }

    try {
        // Fetch restaurants and cafes in separate requests (API only allows one type)
        const [restaurants, cafes, takeaways] = await Promise.all([
            fetchByType(lat, lng, 'restaurant', GOOGLE_API_KEY),
            fetchByType(lat, lng, 'cafe', GOOGLE_API_KEY),
            fetchByType(lat, lng, 'meal_takeaway', GOOGLE_API_KEY),
        ])

        // Merge and deduplicate by place_id
        const seen = new Set<string>()
        const combined = [...restaurants, ...cafes, ...takeaways].filter((p: any) => {
            if (seen.has(p.place_id)) return false
            seen.add(p.place_id)
            return true
        })

        logDebug(`>>> [places] Google API returned ${combined.length} combined places`)

        if (combined.length === 0) {
            logDebug('>>> [places] 0 places from Google — returning mock data')
            return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
        }

        // Enrich with photo URL, tags, price labels
        const enriched = combined.map((place: any) => {
            const ref = place.photos?.[0]?.photo_reference
            const photo_url = ref
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${GOOGLE_API_KEY}`
                : 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80'

            const tags: string[] = []
            if (place.types?.includes('cafe')) tags.push('Cafe')
            else if (place.types?.includes('meal_takeaway')) tags.push('Takeaway')
            else if (place.types?.includes('bakery')) tags.push('Bakery')
            else tags.push('Restaurant')

            if ((place.price_level ?? 1) <= 1) tags.push('Budget')
            if (place.opening_hours?.open_now) tags.push('Open Now')

            return {
                place_id: place.place_id,
                name: place.name,
                vicinity: place.vicinity,
                rating: place.rating ?? 0,
                user_ratings_total: place.user_ratings_total ?? 0,
                price_level: place.price_level ?? 1,
                types: place.types ?? [],
                opening_hours: place.opening_hours,
                photo_url,
                distance: null,
                tags,
            }
        })

        return NextResponse.json({ results: enriched, source: 'google' })
    } catch (error) {
        logDebug(`>>> [places] Google Places API error: ${error}`)
        // Always fall back to mock — never return empty
        return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
    }
}
