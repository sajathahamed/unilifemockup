import type { SupabaseClient } from '@supabase/supabase-js'

// Delivery admin accounts (kept aligned with rider-side hidden account requirement)
const DELIVERY_ADMIN_EMAILS = ['easytech6727@gmail.com']

/**
 * True when delivery service is available for new delivery-mode orders.
 * Priority:
 * 1) If configured delivery-admin account(s) exist, require one to be online (is_available=true).
 * 2) Fallback to any online delivery agent when no configured admin account is found.
 */
export async function isDeliveryServiceAvailable(client: SupabaseClient): Promise<boolean> {
  const { data: adminUsers } = await client
    .from('users')
    .select('id, email')
    .eq('role', 'delivery')
    .in('email', DELIVERY_ADMIN_EMAILS)

  const adminIds = (adminUsers ?? []).map((u: any) => u.id)

  if (adminIds.length > 0) {
    const { data: onlineAdmins } = await client
      .from('delivery_agents')
      .select('id')
      .in('id', adminIds)
      .eq('is_available', true)
      .limit(1)

    return !!onlineAdmins && onlineAdmins.length > 0
  }

  // Fallback path when configured admin account is not found in DB
  const { data: onlineAgents } = await client
    .from('delivery_agents')
    .select('id')
    .eq('is_available', true)
    .limit(1)

  return !!onlineAgents && onlineAgents.length > 0
}
