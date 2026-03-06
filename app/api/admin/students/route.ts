import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/students — list students (id, name, email) for admin dropdowns */
export async function GET() {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { data, error } = await client
      .from('users')
      .select('id, name, email')
      .eq('role', 'student')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data || [])
  } catch (e) {
    console.error('Admin students GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
