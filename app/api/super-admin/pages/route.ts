import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth.server'
import { hasRoleAccess } from '@/lib/auth'
import {
  getAllAppPages,
  getPagesWithPermissionsForRole,
  getPagesWithPermissionsForUser,
  setPagePermission,
  setUserPagePermission,
  setRolePagePermissionBulk,
  getUsersByRole,
  getUserByEmail,
} from '@/lib/pages/permissions.server'
import type { UserRole } from '@/lib/auth'
import { ROLES } from '@/lib/pages/registry'

/**
 * GET /api/super-admin/pages?role=student
 *        ?user_id=123
 *        ?role=student&users=1  (list users for role)
 *        ?email=john@uni.edu   (lookup user by email)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasRoleAccess(user.role, 'super_admin')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const userIdParam = request.nextUrl.searchParams.get('user_id')
    const role = request.nextUrl.searchParams.get('role') as UserRole | null
    const listUsers = request.nextUrl.searchParams.get('users') === '1'
    const email = request.nextUrl.searchParams.get('email')

    if (email) {
      const u = await getUserByEmail(email)
      return NextResponse.json({ user: u }, { status: 200 })
    }
    if (listUsers && role && ROLES.includes(role)) {
      const search = request.nextUrl.searchParams.get('search') || ''
      const users = await getUsersByRole(role, search)
      return NextResponse.json({ users }, { status: 200 })
    }
    if (userIdParam) {
      const userId = parseInt(userIdParam, 10)
      if (!Number.isNaN(userId)) {
        const pages = await getPagesWithPermissionsForUser(userId)
        return NextResponse.json({ user_id: userId, pages }, { status: 200 })
      }
    }
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
 * Body: { type: 'role', role, page_id, enabled }
 *    or { type: 'role_bulk', roles: string[], page_id, enabled }
 *    or { type: 'user', user_id: number, page_id, enabled }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasRoleAccess(user.role, 'super_admin')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const type = body.type ?? 'role'
    const pageId = typeof body.page_id === 'number' ? body.page_id : parseInt(body.page_id, 10)
    const enabled = Boolean(body.enabled)

    if (Number.isNaN(pageId)) {
      return NextResponse.json({ message: 'Bad request: page_id required' }, { status: 400 })
    }

    if (type === 'user') {
      const userId = typeof body.user_id === 'number' ? body.user_id : parseInt(body.user_id, 10)
      if (Number.isNaN(userId)) {
        return NextResponse.json({ message: 'Bad request: user_id required for type=user' }, { status: 400 })
      }
      const { error } = await setUserPagePermission(userId, pageId, enabled)
      if (error) return NextResponse.json({ message: error }, { status: 400 })
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (type === 'role_bulk') {
      const roles = body.roles
      if (!Array.isArray(roles) || roles.length === 0) {
        return NextResponse.json({ message: 'Bad request: roles[] required for type=role_bulk' }, { status: 400 })
      }
      const valid = roles.filter((r: string) => ROLES.includes(r))
      if (valid.length === 0) return NextResponse.json({ message: 'No valid roles' }, { status: 400 })
      const { error } = await setRolePagePermissionBulk(valid as UserRole[], pageId, enabled)
      if (error) return NextResponse.json({ message: error }, { status: 400 })
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const role = body.role
    if (!role || !ROLES.includes(role)) {
      return NextResponse.json({ message: 'Bad request: valid role required' }, { status: 400 })
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
