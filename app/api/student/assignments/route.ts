import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/assignments
 * List all assignments (all courses) with submission status for current student.
 */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()

    const { data: assignments, error: assignError } = await client
      .from('assignments')
      .select('*, courses(course_code, course_name)')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (assignError) {
      console.error('Student assignments error:', assignError)
      return NextResponse.json(
        { message: assignError.message || 'Failed to fetch assignments' },
        { status: 400 }
      )
    }

    const list = assignments || []
    const assignmentIds = list.map((a: { id: number }) => a.id)
    if (list.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const { data: submissions } = await client
      .from('assignment_submissions')
      .select('assignment_id, id, status, submitted_at')
      .eq('student_id', user.id)
      .in('assignment_id', assignmentIds)

    const byAssignment = (submissions || []).reduce(
      (acc: Record<number, { id: number; status: string; submitted_at: string | null }>, s: { assignment_id: number; id: number; status: string; submitted_at: string | null }) => {
        acc[s.assignment_id] = { id: s.id, status: s.status, submitted_at: s.submitted_at ?? null }
        return acc
      },
      {}
    )

    const result = list.map((row: Record<string, unknown>) => {
      const sub = byAssignment[Number(row.id)]
      return mapRow(row, sub)
    })

    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    console.error('Student assignments error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

function mapRow(
  row: Record<string, unknown>,
  submission: { id: number; status: string; submitted_at: string | null } | null
) {
  const courses = row.courses as { course_code?: string; course_name?: string } | null
  const { courses: _c, ...rest } = row
  return {
    ...rest,
    course_code: courses?.course_code ?? null,
    course_name: courses?.course_name ?? null,
    submission_id: submission?.id ?? null,
    submission_status: submission?.status ?? null,
    submitted_at: submission?.submitted_at ?? null,
  }
}
