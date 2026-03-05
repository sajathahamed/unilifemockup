import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth.server'
import { getAllowedNavItemsForRole } from '@/lib/pages/permissions.server'

/**
 * GET /api/nav
 * Returns allowed sidebar nav items for the current user's role.
 * Used by DashboardLayout when DB-backed permissions are enabled.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const items = await getAllowedNavItemsForRole(user.role)
    return NextResponse.json({ items }, { status: 200 })
  } catch (e) {
    console.error('Nav API error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
