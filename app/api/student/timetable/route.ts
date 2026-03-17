import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/timetable
 * Fetches timetable (all scheduled classes) with course details for student view.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const academicYear = request.nextUrl.searchParams.get('academic_year')?.trim() || null
    const client = await createClient()

    let query = client
      .from('timetable')
      .select('*, courses(course_code, course_name, colour)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (academicYear) query = query.eq('academic_year', academicYear)

    const { data, error } = await query
    if (error) throw error

    const rows = (data || []).map((row: Record<string, unknown>) => {
      const courses = row.courses as { course_code?: string; course_name?: string; colour?: string } | null
      const { courses: _, ...rest } = row
      let day_of_week = String(rest.day_of_week ?? '')
      if (day_of_week) day_of_week = day_of_week.charAt(0).toUpperCase() + day_of_week.slice(1).toLowerCase()
      let start_time = rest.start_time
      if (typeof start_time === 'string' && start_time.length > 0 && start_time.length < 5) {
        start_time = (start_time as string).padStart(5, '0')
      }
      const colour = courses?.colour ?? null
      const colorClass = colour && (String(colour).startsWith('bg-') ? colour : `bg-${colour}-500`)
      return {
        id: Number(rest.id),
        course_id: Number(rest.course_id),
        day_of_week,
        start_time: String(rest.start_time ?? ''),
        end_time: String(rest.end_time ?? ''),
        location: String(rest.location ?? ''),
        academic_year: rest.academic_year != null ? String(rest.academic_year) : undefined,
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
        color: colorClass || 'bg-blue-500',
      }
    })

    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error('Student timetable error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
