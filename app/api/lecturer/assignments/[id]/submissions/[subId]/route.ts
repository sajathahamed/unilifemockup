import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/lecturer/assignments/[id]/submissions/[subId]
 * Grade a submission (lecturer must own the assignment)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id, subId } = await context.params
    const assignmentId = parseInt(id, 10)
    const submissionId = parseInt(subId, 10)
    if (Number.isNaN(assignmentId) || Number.isNaN(submissionId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { grade, feedback } = body

    const client = await createClient()

    const { data: assignment, error: assignErr } = await client
      .from('assignments')
      .select('id')
      .eq('id', assignmentId)
      .eq('created_by', user.id)
      .single()

    if (assignErr || !assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 })
    }

    const updatePayload: Record<string, unknown> = {}
    if (grade !== undefined) {
      const g = grade === null || grade === '' ? null : Number(grade)
      updatePayload.grade = g
    }
    if (feedback !== undefined) updatePayload.feedback = feedback == null ? null : String(feedback)
    if (grade !== undefined && (grade !== null && grade !== '')) updatePayload.status = 'graded'

    const { data, error } = await client
      .from('assignment_submissions')
      .update(updatePayload)
      .eq('id', submissionId)
      .eq('assignment_id', assignmentId)
      .select()
      .single()

    if (error) {
      console.error('Submission grade error:', error)
      return NextResponse.json({ message: error.message || 'Failed to update submission' }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('Submission PATCH error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
