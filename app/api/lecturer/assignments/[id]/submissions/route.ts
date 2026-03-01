import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/assignments/[id]/submissions
 * List submissions for an assignment (lecturer must own the assignment)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (Number.isNaN(assignmentId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

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

    const { data, error } = await client
      .from('assignment_submissions')
      .select('*, users(id, name, email)')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Submissions list error:', error)
      return NextResponse.json({ message: error.message || 'Failed to fetch submissions' }, { status: 400 })
    }

    const rows = (data || []).map((row: Record<string, unknown>) => {
      const u = row.users as { id?: number; name?: string; email?: string } | null
      const { users: _, ...rest } = row
      return {
        ...rest,
        student_id: row.student_id,
        student_name: u?.name ?? null,
        student_email: u?.email ?? null,
      }
    })

    return NextResponse.json(rows, { status: 200 })
  } catch (e) {
    console.error('Submissions GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
