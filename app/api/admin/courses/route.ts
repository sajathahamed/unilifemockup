import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/courses — list courses for admin (timetable add, etc.) */
export async function GET() {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { data, error } = await client
      .from('courses')
      .select('id, course_code, course_name, colour')
      .order('course_code', { ascending: true })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data || [])
  } catch (e) {
    console.error('Admin courses GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
