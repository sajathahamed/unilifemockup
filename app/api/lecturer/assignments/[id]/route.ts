import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/assignments/[id]
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
    const { data, error } = await client
      .from('assignments')
      .select('*, courses(course_code, course_name)')
      .eq('id', assignmentId)
      .eq('created_by', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 })
    }

    const row = data as Record<string, unknown>
    const courses = row.courses as { course_code?: string; course_name?: string } | null
    const { courses: _, ...rest } = row
    return NextResponse.json({ ...rest, course_code: courses?.course_code ?? null, course_name: courses?.course_name ?? null }, { status: 200 })
  } catch (e) {
    console.error('Assignment GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lecturer/assignments/[id]
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (Number.isNaN(assignmentId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { course_id, title, description, due_date } = body

    const client = await createClient()
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (course_id != null) updatePayload.course_id = Number(course_id)
    if (title !== undefined) updatePayload.title = String(title).trim()
    if (description !== undefined) updatePayload.description = description == null ? null : String(description).trim()
    if (due_date !== undefined) updatePayload.due_date = due_date || null

    const { data, error } = await client
      .from('assignments')
      .update(updatePayload)
      .eq('id', assignmentId)
      .eq('created_by', user.id)
      .select()
      .single()

    if (error) {
      console.error('Assignment update error:', error)
      return NextResponse.json({ message: error.message || 'Failed to update' }, { status: 400 })
    }
    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('Assignment PUT error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lecturer/assignments/[id]
 */
export async function DELETE(
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
    const { error } = await client
      .from('assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('created_by', user.id)

    if (error) {
      console.error('Assignment delete error:', error)
      return NextResponse.json({ message: error.message || 'Failed to delete' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e) {
    console.error('Assignment DELETE error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
