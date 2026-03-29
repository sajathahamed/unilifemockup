import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/student/timetable/reminder
 * Body: { minutes_before: number } — minutes before class to remind (5–120).
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const m = Number(body.minutes_before)
    if (!Number.isFinite(m) || m < 5 || m > 120) {
      return NextResponse.json({ message: 'minutes_before must be 5–120' }, { status: 400 })
    }

    const client = await createClient()
    const { error } = await client.from('users').update({ timetable_reminder_minutes: Math.round(m) }).eq('id', user.id)
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, minutes_before: Math.round(m) }, { status: 200 })
  } catch (error) {
    console.error('reminder PATCH:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
