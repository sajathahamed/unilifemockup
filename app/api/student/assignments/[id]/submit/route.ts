import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/student/assignments/[id]/submit
 * Submit or update own submission for an assignment
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
    const content = body.content != null ? String(body.content).trim() : ''

    const client = await createClient()

    const { data: existing } = await client
      .from('assignment_submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .single()

    if (existing) {
      const { data, error } = await client
        .from('assignment_submissions')
        .update({ content: content || null, submitted_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) {
        console.error('Submission update error:', error)
        return NextResponse.json({ message: error.message || 'Failed to update' }, { status: 400 })
      }
      return NextResponse.json(data, { status: 200 })
    }

    const { data, error } = await client
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        content: content || null,
        status: 'submitted',
      })
      .select()
      .single()

    if (error) {
      console.error('Submission create error:', error)
      return NextResponse.json({ message: error.message || 'Failed to submit' }, { status: 400 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Submit error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
