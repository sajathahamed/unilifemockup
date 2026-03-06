import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/timetable — all timetable entries with course info (admin view) */
export async function GET() {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    // Try with courses join first; if relation doesn't exist, fall back to timetable-only.
    const joinRes = await client
      .from('timetable')
      .select('*, courses(course_code, course_name, colour)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    const baseRes = joinRes.error
      ? await client
          .from('timetable')
          .select('*')
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true })
      : joinRes

    if (baseRes.error) return NextResponse.json({ message: baseRes.error.message }, { status: 400 })

    const rows = (baseRes.data || []).map((row: Record<string, unknown>) => {
      const courses = (row as any).courses as { course_code?: string; course_name?: string; colour?: string } | null
      const { courses: _, ...rest } = row as any
      let day_of_week = String(rest.day_of_week ?? '')
      if (day_of_week) day_of_week = day_of_week.charAt(0).toUpperCase() + day_of_week.slice(1).toLowerCase()
      return {
        ...rest,
        day_of_week,
        course_code: courses?.course_code ?? null,
        course_name: courses?.course_name ?? null,
        colour: courses?.colour ?? null,
      }
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error('Admin timetable GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/admin/timetable — create timetable entry */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { student_id, course_id, day_of_week, start_time, end_time, location, academic_year } = body
    if (!course_id || !day_of_week || !start_time || !end_time) {
      return NextResponse.json(
        { message: 'Required: course_id, day_of_week, start_time, end_time' },
        { status: 400 }
      )
    }
    const studentIdNum = student_id != null && student_id !== '' ? parseInt(String(student_id), 10) : null

    const client = await createClient()
    const { data, error } = await client
      .from('timetable')
      .insert({
        student_id: studentIdNum,
        course_id: parseInt(String(course_id), 10),
        day_of_week: String(day_of_week).trim().toLowerCase(),
        start_time: String(start_time).trim(),
        end_time: String(end_time).trim(),
        location: location != null ? String(location).trim() : null,
        academic_year: academic_year != null && academic_year !== '' ? parseInt(String(academic_year), 10) : null,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e) {
    console.error('Admin timetable POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
