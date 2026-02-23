import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// Curated mock data for when no API key is configured or geolocation fails
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
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
        photos: [{ photo_reference: null }],
        photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        distance: '700m',
        tags: ['Noodles', 'Chinese', 'Soup'],
    },
]

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    // Return mock data if no API key
    if (!GOOGLE_API_KEY) {
        return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
    }

    if (!lat || !lng) {
        return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
    }

    try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
        url.searchParams.set('location', `${lat},${lng}`)
        url.searchParams.set('radius', '1500')
        url.searchParams.set('type', 'restaurant|cafe|bakery|meal_takeaway')
        url.searchParams.set('maxprice', '2') // budget-friendly (0-2 out of 4)
        url.searchParams.set('key', GOOGLE_API_KEY)

        const res = await fetch(url.toString(), { next: { revalidate: 300 } })
        const data = await res.json()

        if (!data.results || data.results.length === 0) {
            return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
        }

        // Attach photo URLs
        const enriched = data.results.map((place: any) => {
            const ref = place.photos?.[0]?.photo_reference
            const photo_url = ref
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${GOOGLE_API_KEY}`
                : 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80'

            const tags: string[] = []
            if (place.types?.includes('cafe')) tags.push('Cafe')
            else if (place.types?.includes('bakery')) tags.push('Bakery')
            else if (place.types?.includes('meal_takeaway')) tags.push('Takeaway')
            else tags.push('Restaurant')
            if (place.price_level === 1) tags.push('Budget')

            return { ...place, photo_url, tags, distance: null }
        })

        return NextResponse.json({ results: enriched, source: 'google' })
    } catch (error) {
        console.error('Places API error:', error)
        return NextResponse.json({ results: MOCK_SHOPS, source: 'mock' })
    }
}
