import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/courses
 * List all courses (for student view)
 */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()
    const { data, error } = await client
      .from('courses')
      .select('id, course_code, course_name, colour')
      .order('course_code', { ascending: true })

    if (error) {
      console.error('Student courses error:', error)
      return NextResponse.json(
        { message: error.message || 'Failed to fetch courses' },
        { status: 400 }
      )
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (e) {
    console.error('Student courses error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
