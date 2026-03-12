import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/assignments
 * List assignments created by the lecturer (optionally filter by course_id)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const courseId = request.nextUrl.searchParams.get('course_id')?.trim() || null
    const client = await createClient()

    let query = client
      .from('assignments')
      .select('*, courses(course_code, course_name)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (courseId) query = query.eq('course_id', parseInt(courseId, 10))

    const { data, error } = await query
    if (error) {
      console.error('Assignments list error:', error)
      return NextResponse.json({ message: error.message || 'Failed to fetch assignments' }, { status: 400 })
    }

    const rows = (data || []).map((row: Record<string, unknown>) => {
      const courses = row.courses as { course_code?: string; course_name?: string } | null
      const { courses: _, ...rest } = row
      return {
        ...rest,
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
      }
    })

    return NextResponse.json(rows, { status: 200 })
  } catch (e) {
    console.error('Assignments GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lecturer/assignments
 * Create a new assignment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { course_id, title, description, due_date } = body

    if (!course_id || !title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { message: 'Missing or invalid: course_id, title (required)' },
        { status: 400 }
      )
    }

    const client = await createClient()
    const { data, error } = await client
      .from('assignments')
      .insert({
        course_id: Number(course_id),
        title: String(title).trim(),
        description: description != null ? String(description).trim() : null,
        due_date: due_date || null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Assignment create error:', error)
      return NextResponse.json({ message: error.message || 'Failed to create assignment' }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Assignments POST error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
