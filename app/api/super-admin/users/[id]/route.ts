import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { getAdminClient } from '@/lib/supabase/admin'

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
