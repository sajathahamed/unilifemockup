import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/courses
 * Returns courses (for lecturer's "My Courses" - all courses for now; filter by lecturer_id when schema supports it)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Please log in as a lecturer to view courses.' }, { status: 401 })

    const client = await createClient()
    const { data, error } = await client
      .from('courses')
      .select('id, course_code, course_name, colour')
      .order('course_code', { ascending: true })

    if (error) {
      console.error('Lecturer courses error:', error)
      // Table might not exist yet (e.g. PGRST205) - return empty so UI still works
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json([], { status: 200 })
      }
      return NextResponse.json({ message: error.message || 'Failed to fetch courses' }, { status: 400 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (e) {
    console.error('Lecturer courses GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
