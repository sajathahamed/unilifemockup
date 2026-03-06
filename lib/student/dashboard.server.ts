/**
 * Server-only data for student dashboard.
 */
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth.server'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface StudentDashboardData {
  coursesCount: number
  timetableToday: Array<{
    id: number
    course_id: number
    day_of_week: string
    start_time: string
    end_time: string
    location: string
    course_code?: string
    course_name?: string
  }>
  assignmentsCount: number
}

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const user = await requireRole('student')
  const client = await createClient()

  const today = new Date()
  const todayDayName = DAY_NAMES[today.getDay()]

  const [coursesRes, timetableRes, assignmentsRes] = await Promise.all([
    client.from('courses').select('id', { count: 'exact', head: true }),
    client
      .from('timetable')
      .select('*, courses(course_code, course_name)')
      .order('start_time', { ascending: true }),
    client.from('assignments').select('id', { count: 'exact', head: true }),
  ])

  const coursesCount = coursesRes.count ?? 0
  const assignmentsCount = assignmentsRes.error ? 0 : (assignmentsRes.count ?? 0)

  const timetableRows = (timetableRes.error ? [] : (timetableRes.data || [])).map(
    (row: Record<string, unknown>) => {
      const courses = row.courses as { course_code?: string; course_name?: string } | null
      const { courses: _, ...rest } = row
      let day_of_week = String(rest.day_of_week ?? '')
      if (day_of_week) day_of_week = day_of_week.charAt(0).toUpperCase() + day_of_week.slice(1).toLowerCase()
      return {
        ...rest,
        id: Number(rest.id),
        course_id: Number(rest.course_id),
        day_of_week,
        start_time: String(rest.start_time ?? ''),
        end_time: String(rest.end_time ?? ''),
        location: String(rest.location ?? ''),
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
      }
    }
  )

  const timetableToday = timetableRows.filter((r: { day_of_week: string }) => r.day_of_week === todayDayName)

  return {
    coursesCount,
    timetableToday,
    assignmentsCount,
  }
}
