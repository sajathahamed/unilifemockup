import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import {
  getAllAppPages,
  getPagesWithPermissionsForRole,
  setPagePermission,
} from '@/lib/pages/permissions.server'
import type { UserRole } from '@/lib/auth'
import { ROLES } from '@/lib/pages/registry'

/**
 * GET /api/super-admin/pages?role=student
 * Returns all app_pages; if role query provided, returns pages for that role with enabled flag.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('super_admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const role = request.nextUrl.searchParams.get('role') as UserRole | null
    if (role && ROLES.includes(role)) {
      const withPerms = await getPagesWithPermissionsForRole(role)
      return NextResponse.json({ role, pages: withPerms }, { status: 200 })
    }
    const all = await getAllAppPages()
    return NextResponse.json({ pages: all }, { status: 200 })
  } catch (e) {
    console.error('Super-admin pages GET error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/super-admin/pages
 * Body: { role: string, page_id: number, enabled: boolean }
 * Updates one role page permission.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('super_admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { role, page_id: pageId, enabled } = body
    if (!role || typeof pageId !== 'number' || typeof enabled !== 'boolean') {
      return NextResponse.json({ message: 'Bad request: role, page_id, enabled required' }, { status: 400 })
    }
    if (!ROLES.includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    const { error } = await setPagePermission(role as UserRole, pageId, enabled)
    if (error) return NextResponse.json({ message: error }, { status: 400 })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error('Super-admin pages PATCH error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
