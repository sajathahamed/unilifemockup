import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/reports — stats for reports page (user counts by role, laundry, vendors, timetable, announcements) */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') // 'json' | 'csv' (for export)

    const [usersRes, laundryRes, foodStallsRes, timetableRes, announcementsRes] = await Promise.all([
      client.from('users').select('role'),
      client.from('laundry_shops').select('*', { count: 'exact', head: true }),
      client.from('food_stalls').select('*', { count: 'exact', head: true }),
      client.from('timetable').select('*', { count: 'exact', head: true }),
      client.from('announcements').select('*', { count: 'exact', head: true }),
    ])

    const userList = (usersRes.data ?? []) as { role: string }[]
    const byRole: Record<string, number> = {}
    userList.forEach((u) => {
      byRole[u.role] = (byRole[u.role] || 0) + 1
    })

    const stats = {
      users: {
        total: userList.length,
        byRole: byRole as Record<string, number>,
      },
      laundry_shops: laundryRes.count ?? 0,
      food_stalls: foodStallsRes.count ?? 0,
      timetable_entries: timetableRes.count ?? 0,
      announcements: announcementsRes.count ?? 0,
    }

    if (format === 'csv') {
      const rows: string[] = [
        'Report,Value',
        `Total users,${stats.users.total}`,
        ...Object.entries(stats.users.byRole).map(([role, n]) => `Users (${role}),${n}`),
        `Laundry shops,${stats.laundry_shops}`,
        `Food stalls,${stats.food_stalls}`,
        `Timetable entries,${stats.timetable_entries}`,
        `Announcements,${stats.announcements}`,
      ]
      return new NextResponse(rows.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="admin-report-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    return NextResponse.json(stats)
  } catch (e) {
    console.error('Admin reports GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
