import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/assignments
 * Returns all assignments (student can view and submit)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()
    const { data, error } = await client
      .from('assignments')
      .select('*, courses(course_code, course_name)')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Student assignments list error:', error)
      return NextResponse.json({ message: error.message || 'Failed to fetch assignments' }, { status: 400 })
    }

    const rows = (data || []).map((row: Record<string, unknown>) => {
      const courses = row.courses as { course_code?: string; course_name?: string } | null
      const { courses: _, ...rest } = row
      return {
        ...rest,
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
      }
    })

    return NextResponse.json(rows, { status: 200 })
  } catch (e) {
    console.error('Student assignments GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
