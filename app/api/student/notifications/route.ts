import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/student/notifications
 * Recent class reminders (in_app channel).
 */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const client = await createClient()
    const { data, error } = await client
      .from('timetable_notifications')
      .select('id, message, notify_at, sent_at, status, channel')
      .eq('user_id', user.id)
      .order('notify_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('notifications GET:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
