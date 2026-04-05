/**
 * Server-only: fetch courses for lecturer (My Courses & assignment dropdown).
 */
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth.server'

export interface LecturerCourse {
  id: number
  course_code: string
  course_name: string
  colour?: string | null
}

function normalizeCourse(row: Record<string, unknown>): LecturerCourse {
  return {
    id: Number(row.id) || 0,
    course_code: (row.course_code ?? row.code ?? '') as string,
    course_name: (row.course_name ?? row.name ?? '') as string,
    colour: (row.colour ?? row.color ?? null) as string | null | undefined,
  }
}

export async function getLecturerCourses(): Promise<LecturerCourse[]> {
  await requireRole('lecturer')
  const client = await createClient()

  // Select * so we work even if only some columns exist; then normalize
  const { data, error } = await client
    .from('courses')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      return []
    }
    console.error('Lecturer courses server error:', error)
    return []
  }

  const rows = Array.isArray(data) ? data : []
  return rows.map((r) => normalizeCourse(r as Record<string, unknown>)).filter((c) => c.id && (c.course_code || c.course_name))
}
