import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/timetable
 * Returns timetable entries with course info for lecturer schedule page.
 * Query: ?academic_year=1|2|3|4 to filter by study year (uses timetable.academic_year if column exists).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const academicYearParam = searchParams.get('academic_year')
    const academic_year = academicYearParam && /^[1-4]$/.test(academicYearParam) ? parseInt(academicYearParam, 10) : null

    const client = await createClient()
    let query = client
      .from('timetable')
      .select('*, courses(course_code, course_name, colour)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (academic_year != null) {
      query = query.eq('academic_year', academic_year)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json([], { status: 200 })
      }
      if (error.message?.includes('academic_year')) {
        return NextResponse.json([], { status: 200 })
      }
      console.error('Lecturer timetable error:', error)
      return NextResponse.json({ message: error.message || 'Failed to fetch timetable' }, { status: 400 })
    }

    const rows = (data || []).map((row: Record<string, unknown>) => {
      const courses = row.courses as { course_code?: string; course_name?: string; colour?: string } | null
      const { courses: _, ...rest } = row
      let day_of_week = String(rest.day_of_week ?? '')
      if (day_of_week) day_of_week = day_of_week.charAt(0).toUpperCase() + day_of_week.slice(1).toLowerCase()
      return {
        ...rest,
        day_of_week,
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
        colour: courses?.colour ?? null,
      }
    })

    return NextResponse.json(rows, { status: 200 })
  } catch (e) {
    console.error('Lecturer timetable GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
