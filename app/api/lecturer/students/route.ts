import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/students
 * Returns students (users with role student) for lecturer view
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Please log in as a lecturer to view students.' }, { status: 401 })

    const client = await createClient()
    const { data, error } = await client
      .from('users')
      .select('id, name, email, uni_id, created_at')
      .eq('role', 'student')
      .order('name', { ascending: true })

    if (error) {
      console.error('Lecturer students error:', error)
      // Table/column might not exist or RLS - return empty so UI still works
      if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('schema cache')) {
        return NextResponse.json([], { status: 200 })
      }
      return NextResponse.json({ message: error.message || 'Failed to fetch students' }, { status: 400 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (e) {
    console.error('Lecturer students GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
