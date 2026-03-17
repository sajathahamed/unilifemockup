import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

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

  return {
    id: row.id ?? row.menu_item_id ?? row.item_id ?? null,
    name: typeof name === 'string' ? name : String(name ?? ''),
    price,
    food_category: food_category != null ? String(food_category) : null,
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
    const stallId = parseInt(id, 10)
    if (Number.isNaN(stallId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()

    const fetchMenuFromTable = async (table: string) => {
      // Try common FK column names for the stall reference.
      const fkColumns = ['stall_id', 'food_stall_id', 'shop_id']
      let last: unknown = null
      for (const fk of fkColumns) {
        const q = (client.from(table) as any).select('*').eq(fk, stallId).order('id', { ascending: true })
        const { data, error } = await q
        if (!error) return data ?? []
        last = error
      }
      throw last ?? new Error(`No FK matched for ${table}`)
    }

    // Try common schemas:
    // 1) food_stalls with a relationship to menu_items
    // 2) food_stalls alone, and menu items in a separate table
    const attempts: Array<() => Promise<{
      stall: any
      menu: any[]
    }>> = [
      async () => {
        const { data, error } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time, menu_items(id, name, price, food_category)')
          .eq('id', stallId)
          .single()
        if (error || !data) throw error ?? new Error('Not found')
        return { stall: data, menu: data.menu_items ?? [] }
      },
      async () => {
        const { data, error } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time, food_menu_items(id, name, price, food_category)')
          .eq('id', stallId)
          .single()
        if (error || !data) throw error ?? new Error('Not found')
        return { stall: data, menu: data.food_menu_items ?? [] }
      },
      async () => {
        const { data: stall, error: stallError } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .eq('id', stallId)
          .single()
        if (stallError || !stall) throw stallError ?? new Error('Not found')

        const { data: menu, error: menuError } = await client
          .from('menu_items')
          .select('id, name, price, food_category')
          .eq('stall_id', stallId)
          .order('id', { ascending: true })
        if (menuError) throw menuError
        return { stall, menu: menu ?? [] }
      },
      async () => {
        const { data: stall, error: stallError } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .eq('id', stallId)
          .single()
        if (stallError || !stall) throw stallError ?? new Error('Not found')

        const { data: menu, error: menuError } = await client
          .from('food_stall_menu_items')
          .select('id, name, price, food_category')
          .eq('stall_id', stallId)
          .order('id', { ascending: true })
        if (menuError) throw menuError
        return { stall, menu: menu ?? [] }
      },
      // Additional fallback tables used in some Supabase schemas
      async () => {
        const { data: stall, error: stallError } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .eq('id', stallId)
          .single()
        if (stallError || !stall) throw stallError ?? new Error('Not found')
        const menu = await fetchMenuFromTable('food_menu_items')
        return { stall, menu }
      },
      async () => {
        const { data: stall, error: stallError } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .eq('id', stallId)
          .single()
        if (stallError || !stall) throw stallError ?? new Error('Not found')
        const menu = await fetchMenuFromTable('food_menus')
        return { stall, menu }
      },
      async () => {
        const { data: stall, error: stallError } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .eq('id', stallId)
          .single()
        if (stallError || !stall) throw stallError ?? new Error('Not found')
        const menu = await fetchMenuFromTable('food_stall_menus')
        return { stall, menu }
      },
      async () => {
        const { data: stall, error: stallError } = await client
          .from('food_stalls')
          .select('id, shop_name, address, banner, logo, is_open, opening_time, closing_time')
          .eq('id', stallId)
          .single()
        if (stallError || !stall) throw stallError ?? new Error('Not found')
        const menu = await fetchMenuFromTable('food_stall_menu')
        return { stall, menu }
      },
    ]

    let resolved: { stall: any; menu: any[] } | null = null
    let lastError: unknown = null
    for (const run of attempts) {
      try {
        resolved = await run()
        break
      } catch (e) {
        lastError = e
      }
    }

    if (!resolved?.stall) {
      const message =
        lastError instanceof Error ? lastError.message : 'Food stall not found'
      return NextResponse.json({ message }, { status: 404 })
    }

    const stall = resolved.stall
    const menu = resolved.menu ?? []

    return NextResponse.json(
      {
        shop_name: stall.shop_name ?? stall.name ?? `Food Stall #${stallId}`,
        address: stall.address ?? null,
        banner: stall.banner ?? null,
        logo: stall.logo ?? null,
        is_open: stall.is_open ?? null,
        opening_time: stall.opening_time ?? null,
        closing_time: stall.closing_time ?? null,
        menu_items: menu
          .map((m: any) => normalizeMenuItem(m))
          .filter((m: any) => m.id != null && m.name),
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

