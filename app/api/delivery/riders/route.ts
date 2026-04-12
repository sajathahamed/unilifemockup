import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** Hardcoded accounts that must never appear in the riders list */
const HIDDEN_EMAILS = new Set(['easytech6727@gmail.com'])

/**
 * GET /api/delivery/riders — List all users with delivery role.
 * Returns rider info + phone from `delivery_agents` + count of active deliveries.
 * The is_available flag comes from delivery_agents table (admin-controlled toggle).
 */
export async function GET() {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()

    // Get all delivery-role users (excluding hardcoded hidden accounts)
    const { data: users, error } = await client
      .from('users')
      .select('id, name, email, photo_url')
      .eq('role', 'delivery')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    // Get phones and availability (is_available) from delivery_agents
    const { data: profiles } = await client
      .from('delivery_agents')
      .select('id, phone, is_available')

    const agentMap = new Map((profiles ?? []).map(p => [String(p.id), p]))

    // Get active delivery counts per rider
    const { data: deliveries } = await client
      .from('deliveries')
      .select('delivery_agent_id, status')
      .in('status', ['assigned', 'picked_up'])

    const activeCountMap = new Map<string, number>()
    for (const d of deliveries ?? []) {
      const key = String(d.delivery_agent_id)
      activeCountMap.set(key, (activeCountMap.get(key) ?? 0) + 1)
    }

    const riders = (users ?? [])
      .filter(u => !HIDDEN_EMAILS.has(u.email?.toLowerCase() ?? ''))
      .map(u => {
        const agent = agentMap.get(String(u.id))
        // is_available: use DB value; default true if no agent record yet
        const isAvailable = agent ? (agent.is_available ?? true) : true
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: agent?.phone || '',
          photo_url: u.photo_url ?? null,
          active_deliveries: activeCountMap.get(String(u.id)) ?? 0,
          is_available: isAvailable,
        }
      })

    return NextResponse.json({ riders })
  } catch (e) {
    console.error('Delivery riders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
