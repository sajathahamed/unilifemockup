import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/assignments/[id]/submission
 * Get current student's submission for this assignment
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (Number.isNaN(assignmentId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data, error } = await client
      .from('assignment_submissions')
      .select('id, content, submitted_at, grade, feedback, status')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 400 })
    }

    return NextResponse.json(data ?? null, { status: 200 })
  } catch (e) {
    console.error('Student submission GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/assignments/[id]/submission
 * Create or update the current student's submission for this assignment.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (Number.isNaN(assignmentId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 })
    }

    const client = await createClient()

    // Upsert based on (assignment_id, student_id). Ensure you have a unique constraint for this pair in DB.
    const { data, error } = await client
      .from('assignment_submissions')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: user.id,
          content,
          submitted_at: new Date().toISOString(),
          status: 'submitted',
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select('id, content, submitted_at, grade, feedback, status')
      .single()

    if (error) {
      console.error('Student submission POST error:', error)
      return NextResponse.json({ message: error.message || 'Failed to save submission' }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('Student submission POST error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
