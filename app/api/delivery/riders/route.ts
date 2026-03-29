import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/delivery/riders — List all users with delivery role.
 * Returns rider info + phone from `rider_profiles` + count of active deliveries.
 */
export async function GET() {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()

    // Get all delivery-role users
    const { data: users, error } = await client
      .from('users')
      .select('id, name, email, photo_url')
      .eq('role', 'delivery')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    // Get phones from delivery_agents
    const { data: profiles } = await client
      .from('delivery_agents')
      .select('id, phone')
      
    const phoneMap = new Map((profiles ?? []).map(p => [String(p.id), p.phone]))

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

    const riders = (users ?? []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: phoneMap.get(String(u.id)) || '',
      photo_url: u.photo_url ?? null,
      active_deliveries: activeCountMap.get(String(u.id)) ?? 0,
      is_available: (activeCountMap.get(String(u.id)) ?? 0) < 5, // Available if fewer than 5 active
    }))

    return NextResponse.json({ riders })
  } catch (e) {
    console.error('Delivery riders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
