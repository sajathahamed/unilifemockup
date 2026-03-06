import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/timetable
 * Returns timetable entries with course info (all classes for the week)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()
    const { data, error } = await client
      .from('timetable')
      .select('*, courses(course_code, course_name, colour)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Student timetable error:', error)
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
    console.error('Student timetable GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
