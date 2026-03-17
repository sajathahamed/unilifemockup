import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // This endpoint only returns public stall listings + nearby places.
    // If auth is missing/misconfigured, still return data instead of 401 so the UI can render.
    await verifyRole('student').catch(() => null)

    const url = new URL(request.url)
    const latStr = url.searchParams.get('lat')
    const lngStr = url.searchParams.get('lng')

    const client = await createClient()

    // DB food stalls (try common relationships; fall back to stall list only)
    const dbAttempts: Array<() => Promise<any[]>> = [
      async () => {
        const { data, error } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time, menu_items(id, name, price, food_category)')
          .order('id', { ascending: true })
        if (error) throw error
        return data ?? []
      },
      async () => {
        const { data, error } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time, food_menu_items(id, name, price, food_category)')
          .order('id', { ascending: true })
        if (error) throw error
        return data ?? []
      },
      async () => {
        const { data, error } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .order('id', { ascending: true })
        if (error) throw error
        return data ?? []
      },
    ]

    let dbRows: any[] = []
    for (const run of dbAttempts) {
      try {
        dbRows = await run()
        break
      } catch (e) {
        // keep trying
      }
    }

    const dbResults = (dbRows ?? []).map((r: any) => {
      const menu_items = r.menu_items ?? r.food_menu_items ?? undefined
      const photo = r.banner || r.logo || 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80'
      return {
        place_id: `db-${r.id}`,
        name: r.shop_name ?? r.name ?? `Food Stall #${r.id}`,
        vicinity: r.address ?? 'Campus Area',
        rating: 4.6,
        user_ratings_total: 0,
        price_level: 1,
        types: ['canteen', 'restaurant', 'database'],
        opening_hours: { open_now: r.is_open ?? true },
        photo_url: photo,
        distance: null,
        tags: ['DB Stall'],
        menu_items,
        source: 'database',
      }
    })

    // Nearby results (Google/OSM/Woosmap/etc). Only call if lat/lng provided.
    let nearResults: any[] = []
    let nearSource: string | null = null
    let nearError: string | null = null
    if (latStr && lngStr) {
      const target = new URL('/api/places', url.origin)
      target.searchParams.set('lat', latStr)
      target.searchParams.set('lng', lngStr)

      const res = await fetch(target, { method: 'GET', headers: request.headers, cache: 'no-store' })
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => null)
        if (data?.results) nearResults = data.results
        nearSource = data?.source ?? null
        nearError = data?.error ?? data?.woos_error ?? null
      } else {
        const text = await res.text().catch(() => '')
        nearError = `Places upstream did not return JSON (HTTP ${res.status}): ${text.slice(0, 120)}`
      }
    }

    // Merge + simple de-dupe by name
    const merged: any[] = [...dbResults]
    for (const s of nearResults ?? []) {
      const name = String(s?.name ?? '').trim().toLowerCase()
      if (name && merged.some((m) => String(m?.name ?? '').trim().toLowerCase() === name)) continue
      merged.push(s)
    }

    const source =
      dbResults.length > 0 && (nearResults?.length ?? 0) > 0 ? 'mixed' : dbResults.length > 0 ? 'database' : (nearResults?.length ?? 0) > 0 ? (nearSource ?? 'google') : 'empty'

    return NextResponse.json(
      {
        results: merged,
        source,
        db_count: dbResults.length,
        near_count: nearResults?.length ?? 0,
        near_error: nearError,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('Student food stalls GET error:', e)
    return NextResponse.json(
      { results: [], source: 'error', error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

