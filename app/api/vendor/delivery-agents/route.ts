import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/vendor/delivery-agents — list users with delivery role */
export async function GET() {
  try {
    const user = await verifyRole('vendor-food')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { data, error } = await client
      .from('users')
      .select('id, name, email')
      .eq('role', 'delivery')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ agents: data ?? [] })
  } catch (e) {
    console.error('Vendor delivery-agents GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
