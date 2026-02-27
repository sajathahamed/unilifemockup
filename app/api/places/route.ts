import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
// @ts-ignore
import getLocations from 'restaurant-location-search-api'

function logDebug(message: string) {
    const logPath = path.join(process.cwd(), 'debug_api.log')
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logPath, `${timestamp} - ${message}\n`)
}

// Map OSM categories to Unsplash placeholder images
const CATEGORY_IMAGES: Record<string, string> = {
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    cafe: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    fast_food: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    bar: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
    pub: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
    mcdonalds: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
    burger_king: 'https://images.unsplash.com/photo-1571091718767-18b5c1457add?w=600&q=80',
    default: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80',
}

async function fetchFromOverpass(lat: string, lng: string) {
    const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|cafe|fast_food|food_court|bakery"](around:3000,${lat},${lng});
      way["amenity"~"restaurant|cafe|fast_food|food_court|bakery"](around:3000,${lat},${lng});
    );
    out center;
    `
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

    logDebug(`>>> Fetching from Overpass (OSM) near ${lat},${lng}...`)

    try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Overpass API failed with status ${res.status}`)
        const data = await res.json()
        logDebug(`>>> Overpass returned ${data.elements?.length ?? 0} results`)
        return { elements: data.elements || [], error: null }
    } catch (err: any) {
        logDebug(`>>> Overpass fetch error: ${err.message}`)
        return { elements: [], error: err.message }
    }
}

async function fetchFromWoosmap(lat: string, lng: string) {
    const key = process.env.WOOSMAP_API_KEY
    if (!key) return { results: [], error: 'Woosmap Key missing' }

    const url = `https://api.woosmap.com/localities/nearby?location=${lat},${lng}&types=business.food_and_drinks|business.shop&key=${key}`
    try {
        const res = await fetch(url)
        if (!res.ok) return { results: [], error: `Woosmap failed: ${res.status}` }
        const data = await res.json()
        return { results: data.results || [], error: null }
    } catch (err: any) {
        return { results: [], error: err.message }
    }
}

async function fetchChains(lat: number, lng: number) {
    const chains = ['mcdonalds', 'burgerKing', 'tacoBell', 'popeyes', 'chipotle', 'wendys']
    const results: any[] = []

    for (const chain of chains) {
        try {
            // getLocations(spotName, {lat, long}, radius, maxResults)
            const data = await getLocations(chain, { lat, long: lng }, '5', '3')
            if (data && data.nearByStores) {
                results.push(...data.nearByStores.map((s: any) => ({ ...s, chain_name: chain })))
            }
        } catch (e) {
            console.error(`Failed to fetch chain ${chain}:`, e)
        }
    }
    return results
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get('lat')
    const lngStr = searchParams.get('lng')

    logDebug(`>>> API /api/places CALLED with Overpass & Woosmap: lat=${latStr}, lng=${lngStr}`)

    if (!latStr || !lngStr) {
        return NextResponse.json({ results: [], source: 'mixed' })
    }

    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)

    try {
        // Parallel fetch
        const [osm, woos, chainData] = await Promise.all([
            fetchFromOverpass(latStr, lngStr),
            fetchFromWoosmap(latStr, lngStr),
            fetchChains(lat, lng)
        ])

        const results: any[] = []

        // Map Chain results
        chainData.forEach((s: any) => {
            results.push({
                place_id: `chain-${s.storeNumber || Math.random()}`,
                name: s.chain_name.toUpperCase() + (s.address?.city ? ` - ${s.address.city}` : ''),
                vicinity: s.address?.streetAddress || 'Nearby',
                rating: 4.2,
                user_ratings_total: 100,
                price_level: 2,
                types: ['restaurant', 'fast_food', s.chain_name],
                opening_hours: { open_now: s.storeStatus === 'openNow' },
                photo_url: CATEGORY_IMAGES[s.chain_name] || CATEGORY_IMAGES.fast_food,
                distance: s.formattedDistance || null,
                tags: ['Fast Food', s.chain_name.charAt(0).toUpperCase() + s.chain_name.slice(1)],
                source: 'chain'
            })
        })

        // Map Woosmap results
        woos.results.forEach((w: any) => {
            const type = w.types?.[0] || 'shop'
            results.push({
                place_id: `woos-${w.public_id}`,
                name: w.name || 'Local Shop',
                vicinity: w.address?.formatted_address || 'Nearby',
                rating: 4.5,
                user_ratings_total: 50,
                price_level: 1,
                types: w.types || [],
                opening_hours: { open_now: true },
                photo_url: CATEGORY_IMAGES.default,
                distance: `${(w.distance / 1000).toFixed(1)} km`,
                tags: [type.split('.').pop()],
                source: 'woosmap'
            })
        })

        // Map OSM results (if others are low)
        osm.elements.forEach((el: any) => {
            const tags = el.tags || {}
            const amenity = tags.amenity || 'restaurant'
            const DisplayName = tags.name || 'Local Stall'

            // Avoid duplicates if possible (simple name check)
            if (results.some(r => r.name.toLowerCase() === DisplayName.toLowerCase())) return

            results.push({
                place_id: `osm-${el.id}`,
                name: DisplayName,
                vicinity: tags['addr:street'] || 'Nearby',
                rating: 4.0 + (Math.random() * 0.8),
                user_ratings_total: 25,
                price_level: 1,
                types: [amenity],
                opening_hours: { open_now: true },
                photo_url: CATEGORY_IMAGES[amenity] || CATEGORY_IMAGES.default,
                distance: null,
                tags: [amenity.replace('_', ' ')],
                source: 'osm'
            })
        })

        return NextResponse.json({
            results: results.slice(0, 20),
            source: 'mixed',
            woos_error: woos.error
        })
    } catch (error: any) {
        logDebug(`>>> [places] API error: ${error.message}`)
        return NextResponse.json({ results: [], source: 'error', error: error.message })
    }
}
