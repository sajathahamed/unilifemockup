import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/assignments
 * Returns assignments with course info for lecturer view.
 * Query: ?academic_year=1|2|3|4 to filter by study year.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('lecturer')
    if (!user) return NextResponse.json({ message: 'Please log in as a lecturer to view assignments.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const academicYearParam = searchParams.get('academic_year')
    const academic_year = academicYearParam && /^[1-4]$/.test(academicYearParam) ? parseInt(academicYearParam, 10) : null

    const client = await createClient()
    let query = client
      .from('assignments')
      .select('*, courses(course_code, course_name)')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (academic_year != null) {
      query = query.eq('academic_year', academic_year)
    }

    const { data, error } = await query

    if (error) {
      console.error('Lecturer assignments list error:', error)
      // Table might not exist yet (e.g. PGRST205) - return empty so UI still works
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json([], { status: 200 })
      }
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
    console.error('Lecturer assignments GET error:', e)
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
    if (!user) return NextResponse.json({ message: 'Please log in as a lecturer to create assignments.' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() || null : null
    const due_date = typeof body.due_date === 'string' && body.due_date ? body.due_date : null
    const course_id = typeof body.course_id === 'number' ? body.course_id : (typeof body.course_id === 'string' && body.course_id ? parseInt(body.course_id, 10) : null)
    if (Number.isNaN(course_id as number) || course_id == null) {
      return NextResponse.json({ message: 'Valid course_id is required' }, { status: 400 })
    }
    const academic_year = body.academic_year != null && [1, 2, 3, 4].includes(Number(body.academic_year))
      ? Number(body.academic_year)
      : null

    if (!title || title.length < 2) {
      return NextResponse.json({ message: 'Title is required (at least 2 characters)' }, { status: 400 })
    }

    const client = await createClient()
    const insertPayload: Record<string, unknown> = {
      title,
      description: description || null,
      due_date: due_date || null,
      course_id,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }
    if (academic_year != null) insertPayload.academic_year = academic_year

    const { data, error } = await client
      .from('assignments')
      .insert(insertPayload)
      .select('id, title, description, due_date, course_id, academic_year, created_at')
      .single()

    if (error) {
      console.error('Lecturer assignment create error:', error)
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json({ message: "Assignments table doesn't exist in the database. Please create it in Supabase." }, { status: 400 })
      }
      return NextResponse.json({ message: error.message || 'Failed to create assignment' }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Lecturer assignments POST error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
