import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/assignments/[id]
 * Get a single assignment with current student's submission (if any)
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (Number.isNaN(assignmentId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data: assignment, error: assignError } = await client
      .from('assignments')
      .select('*, courses(course_code, course_name)')
      .eq('id', assignmentId)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 })
    }

    const { data: submission } = await client
      .from('assignment_submissions')
      .select('id, content, status, submitted_at, grade, feedback, file_url, file_name')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .maybeSingle()

    const row = assignment as Record<string, unknown>
    const courses = row.courses as { course_code?: string; course_name?: string } | null
    const { courses: _c, ...rest } = row

    return NextResponse.json(
      {
        ...rest,
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
        submission: submission
          ? {
              id: submission.id,
              content: submission.content,
              status: submission.status,
              submitted_at: submission.submitted_at,
              grade: submission.grade,
              feedback: submission.feedback,
              file_url: submission.file_url ?? null,
              file_name: submission.file_name ?? null,
            }
          : null,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('Student assignment GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
