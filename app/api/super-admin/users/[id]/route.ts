import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * PATCH /api/super-admin/users/[id]
 * Body: `{ "is_active": boolean }` — soft deactivate / reactivate (no row delete).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const current = await verifyRole('super_admin')
    if (!current) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const id = parseInt((await params).id, 10)
    if (Number.isNaN(id)) return NextResponse.json({ message: 'Invalid user id' }, { status: 400 })

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    const isActive = (body as { is_active?: unknown })?.is_active
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ message: 'Body must include is_active: boolean' }, { status: 400 })
    }
    if (isActive === false && id === current.id) {
      return NextResponse.json({ message: 'Cannot deactivate your own account' }, { status: 400 })
    }

    const admin = getAdminClient()
    const { error } = await admin.from('users').update({ is_active: isActive }).eq('id', id)
    if (error) {
      return NextResponse.json({ message: error.message || 'Failed to update user' }, { status: 400 })
    }
    return NextResponse.json({ ok: true, is_active: isActive }, { status: 200 })
  } catch (e) {
    if (String(e).includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json({ message: 'Server configuration error' }, { status: 503 })
    }
    console.error('Super-admin user PATCH error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/super-admin/users/[id]
 * Super-admin only. Deletes user from public.users and from auth.users (if auth_id present).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const current = await verifyRole('super_admin')
    if (!current) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const id = parseInt((await params).id, 10)
    if (Number.isNaN(id)) return NextResponse.json({ message: 'Invalid user id' }, { status: 400 })
    if (id === current.id) return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 })

    const admin = getAdminClient()

    const { data: target, error: fetchError } = await admin
      .from('users')
      .select('id, auth_id')
      .eq('id', id)
      .single()

    if (fetchError || !target) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (target.auth_id) {
      try {
        await admin.auth.admin.deleteUser(target.auth_id)
      } catch (authErr) {
        console.warn('Auth delete warning (continuing to remove profile):', authErr)
      }
    }

    const { error: deleteError } = await admin.from('users').delete().eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message || 'Failed to delete user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    if (String(e).includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json({ message: 'Server configuration error' }, { status: 503 })
    }
    console.error('Super-admin user delete error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
