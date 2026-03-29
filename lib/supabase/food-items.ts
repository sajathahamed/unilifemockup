import type { SupabaseClient } from '@supabase/supabase-js'

const FOOD_ITEM_STALL_FK_CANDIDATES = ['food_stall_id', 'stall_id', 'shop_id'] as const

/** Detects which column in `food_items` links to the stall table. */
export async function detectFoodItemsStallFk(client: SupabaseClient): Promise<string | null> {
  for (const col of FOOD_ITEM_STALL_FK_CANDIDATES) {
    const { error } = await client.from('food_items').select(col).limit(1)
    if (!error) return col
  }
  return null
}

