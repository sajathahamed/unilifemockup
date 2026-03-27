import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

function normalizeMenuItem(row: Record<string, any>) {
  const name =
    row.name ??
    row.item_name ??
    row.menu_item_name ??
    row.title ??
    row.product_name ??
    null

  const price =
    row.price ??
    row.item_price ??
    row.cost ??
    row.amount ??
    null

  const food_category =
    row.food_category ??
    row.category ??
    row.food_type ??
    row.type ??
    null

  // If this row comes from `food_items`, it uses `category_id` not a label.
  const categoryId = row.category_id
  const categoryFromId =
    typeof categoryId === 'number'
      ? ({
          1: 'Main',
          2: 'Snacks',
          3: 'Sides',
          4: 'Drinks',
          5: 'Desserts',
        } as Record<number, string>)[categoryId]
      : null

  const finalFoodCategory =
    food_category != null
      ? String(food_category)
      : typeof categoryId === 'number'
        ? ({
            1: 'Main',
            2: 'Snacks',
            3: 'Sides',
            4: 'Drinks',
            5: 'Desserts',
          } as Record<number, string>)[categoryId] ?? `Category ${categoryId}`
        : null

  return {
    id: row.id ?? row.menu_item_id ?? row.item_id ?? null,
    name: typeof name === 'string' ? name : String(name ?? ''),
    price,
    food_category: finalFoodCategory,
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Public stall details; don't hard-fail on auth issues.
    await verifyRole('student').catch(() => null)

    const { id } = await context.params
    // Support numeric IDs and UUIDs (your Supabase schema may use either).
    const stallId = /^[0-9]+$/.test(id) ? parseInt(id, 10) : id

    const client = await createClient()

    // 1) Always resolve the stall first.
    const { data: stall, error: stallErr } = await client
      .from('food_stalls')
      .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time, owner_email')
      .eq('id', stallId)
      .single()

    if (stallErr || !stall) {
      return NextResponse.json({ message: 'Food stall not found' }, { status: 404 })
    }

    // 2) Then try to load menu items. If menu lookup fails, return empty menu.
    let menu: any[] = []
    let debugCategoryLookup: any = undefined

    // A) food_stall_menu_items: (schema shows food_stall_id + name/price/food_category)
    try {
      const { data, error } = await client
        .from('food_stall_menu_items')
        .select('id, name, price, food_category, sort_order')
        // NOTE: schema uses `food_stall_id` (uuid). Some schemas use `stall_id`.
        .eq('food_stall_id', stallId)
        .order('sort_order', { ascending: true })
      if (!error && data) menu = data
    } catch {
      // ignore
    }

    // B) food_items: vendor_id keyed; derive vendor via stall.owner_email -> users.email -> users.id
    if (!menu.length) {
      try {
        const ownerEmail = String((stall as any).owner_email || '').trim().toLowerCase()
        if (ownerEmail) {
          const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(ownerEmail)
          const numericLike = /^[0-9]+$/.test(ownerEmail) ? parseInt(ownerEmail, 10) : null

          const ownerMatches = [
            // email exact-ish
            (await client.from('users').select('id').ilike('email', ownerEmail).maybeSingle()),
            // email contains
            (await client.from('users').select('id').ilike('email', `%${ownerEmail}%`).maybeSingle()),
            // email strict
            (await client.from('users').select('id').eq('email', ownerEmail).maybeSingle()),
            // auth_id fallback (if owner_email is actually auth.users.id)
            ...(uuidLike
              ? [(await client.from('users').select('id').eq('auth_id', ownerEmail).maybeSingle())]
              : []),
            ...(numericLike != null ? [(await client.from('users').select('id').eq('id', numericLike).maybeSingle())] : []),
          ]

          const owner = (ownerMatches.map((r: any) => r.data).find((d: any) => d?.id) as any) ?? null

          if (owner?.id) {
            const { data: items, error: itemsErr } = await client
              .from('food_items')
              .select('id, name, price, is_available, category_id')
              .eq('vendor_id', owner.id)
              .order('id', { ascending: true })
            if (!itemsErr && Array.isArray(items)) {
              // Fetch category names by the category_id values present in the items.
              // This works for both numeric IDs and UUID IDs.
              const categoryIds = Array.from(
                new Set(
                  items
                    .map((i: any) => i.category_id)
                    .filter((v: any) => v != null)
                )
              )

              // Normalize for numeric category IDs (avoid string/number mismatch in `.in` queries).
              const normalizedCategoryIds = categoryIds
                .map((v: any) => {
                  if (typeof v === 'number' && Number.isFinite(v)) return v
                  if (typeof v === 'string' && v.trim() && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10)
                  return null
                })
                .filter((v: any) => v != null)

              let catMap: Map<any, string> = new Map()
              if (normalizedCategoryIds.length) {
                let categories: any[] | null = null
                try {
                  const { data } = await client
                    .from('food_categories')
                    .select('id, name')
                    .in('id', normalizedCategoryIds as any[])
                  categories = data as any[] | null
                } catch {
                  // ignore; we'll fall back to admin below
                }

                if (categories && categories.length) {
                  ;(categories ?? []).forEach((c: any) => catMap.set(String(c.id), String(c.name)))
                }

                // If RLS returned empty, try again with admin/service role.
                if ((!categories || categories.length === 0 || catMap.size === 0) && normalizedCategoryIds.length) {
                  try {
                    const admin = getAdminClient()
                    const { data: adminCategories } = await admin
                      .from('food_categories')
                      .select('id, name')
                      .in('id', normalizedCategoryIds as any[])
                    ;(adminCategories ?? []).forEach((c: any) => catMap.set(String(c.id), String(c.name)))
                  } catch {
                    // ignore
                  }
                }
              }

              menu = items.map((i: any) => ({
                id: i.id,
                name: i.name,
                price: i.price,
                category_id: i.category_id,
                food_category: catMap.get(String(i.category_id)) ?? null,
              }))

              // Helpful debug when category names are not resolving.
              debugCategoryLookup = {
                categoryIds,
                normalizedCategoryIds,
                catMapSize: catMap.size,
                catMapKeysSample: Array.from(catMap.keys()).slice(0, 10),
                adminServiceKeyLen: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
                menuSample: menu
                  .slice(0, 5)
                  .map((m: any) => ({ category_id: m.category_id, food_category: m.food_category })),
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // C) last-resort fallback: sometimes vendor_id is the same numeric value as stall.id in certain schemas
    if (!menu.length && typeof stallId === 'number') {
      try {
        const { data: items, error: itemsErr } = await client
          .from('food_items')
          .select('id, name, price, is_available, category_id')
          .eq('vendor_id', stallId)
          .order('id', { ascending: true })
        if (!itemsErr && Array.isArray(items) && items.length > 0) {
          menu = items.map((i: any) => ({ id: i.id, name: i.name, price: i.price, category_id: i.category_id, food_category: null }))
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json(
      {
        // `stall.name` is not guaranteed to be selected from DB.
        shop_name: stall.shop_name ?? `Food Stall #${stallId}`,
        address: stall.address ?? null,
        banner: stall.banner ?? null,
        logo: stall.logo ?? null,
        is_open: stall.is_open ?? null,
        opening_time: stall.opening_time ?? null,
        closing_time: stall.closing_time ?? null,
        menu_items: menu
          .map((m: any) => normalizeMenuItem(m))
          .filter((m: any) => m.id != null && m.name),
        debugCategoryLookup,
        debug_menu_empty:
          menu.length === 0
            ? {
                stall_id: stallId,
                owner_email: (stall as any)?.owner_email ?? null,
              }
            : undefined,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('Food stall GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

