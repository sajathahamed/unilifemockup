/**
 * Server-only data for lecturer dashboard.
 * Use in Server Components (e.g. app/lecturer/dashboard/page.tsx).
 */
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth.server'

export interface DashboardCourse {
  id: number
  course_code: string
  course_name: string
  colour: string | null
}

export interface DashboardStudent {
  id: number
  name: string
  email: string
}

export interface DashboardScheduleEntry {
  id: number
  course_id: number
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  academic_year?: string
  course_code?: string
  course_name?: string
}

export interface LecturerDashboardData {
  courses: DashboardCourse[]
  students: DashboardStudent[]
  schedule: DashboardScheduleEntry[]
}

export async function getLecturerDashboardData(): Promise<LecturerDashboardData> {
  const user = await requireRole('lecturer')
  if (!user) return { courses: [], students: [], schedule: [] }

  const client = await createClient()

  const [coursesRes, studentsRes, scheduleRes] = await Promise.all([
    client.from('courses').select('id, course_code, course_name, colour').order('course_code', { ascending: true }),
    client.from('users').select('id, name, email').eq('role', 'student').order('name', { ascending: true }),
    client
      .from('timetable')
      .select('*, courses(course_code, course_name, colour)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true }),
  ])

  const courses: DashboardCourse[] = ((coursesRes.error ? [] : coursesRes.data) || []).map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    course_code: String(r.course_code ?? ''),
    course_name: String(r.course_name ?? ''),
    colour: r.colour != null ? String(r.colour) : null,
  }))

  const students: DashboardStudent[] = ((studentsRes.error ? [] : studentsRes.data) || []).map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    name: String(r.name ?? ''),
    email: String(r.email ?? ''),
  }))

  const schedule: DashboardScheduleEntry[] = ((scheduleRes.error ? [] : scheduleRes.data) || []).map((row: Record<string, unknown>) => {
    const coursesRow = row.courses as { course_code?: string; course_name?: string } | null
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
      academic_year: rest.academic_year != null ? String(rest.academic_year) : undefined,
      course_code: coursesRow?.course_code ?? undefined,
      course_name: coursesRow?.course_name ?? undefined,
    } as DashboardScheduleEntry
  })

  return { courses, students, schedule }
}
