import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * PATCH /api/admin/users/[id]
 * Body: `{ "is_active": boolean }` — soft deactivate / reactivate.
 */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await verifyRole('admin')
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params
        const userId = parseInt(id, 10)
        if (Number.isNaN(userId)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
        }

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
        if (isActive === false && userId === user.id) {
            return NextResponse.json({ message: 'Cannot deactivate your own account' }, { status: 400 })
        }

        const admin = getAdminClient()
        const { error } = await admin.from('users').update({ is_active: isActive }).eq('id', userId)
        if (error) {
            return NextResponse.json({ message: error.message || 'Failed to update user' }, { status: 400 })
        }
        return NextResponse.json({ ok: true, is_active: isActive }, { status: 200 })
    } catch (error) {
        if (String(error).includes('SUPABASE_SERVICE_ROLE_KEY')) {
            return NextResponse.json({ message: 'Server configuration error' }, { status: 503 })
        }
        console.error('Admin user PATCH error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Requires admin or super_admin role
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Check authorization
        const user = await verifyRole('admin')
        
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await context.params
        const userId = parseInt(id)

        if (isNaN(userId)) {
            return NextResponse.json(
                { message: 'Invalid user ID' },
                { status: 400 }
            )
        }

        const admin = getAdminClient()

        const { data: target, error: fetchError } = await admin
            .from('users')
            .select('id, auth_id')
            .eq('id', userId)
            .single()

        if (fetchError || !target) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        if (target.auth_id) {
            try {
                await admin.auth.admin.deleteUser(target.auth_id)
            } catch (authErr) {
                console.warn('Auth delete warning (continuing to remove profile):', authErr)
            }
        }

        const { error: deleteError } = await admin.from('users').delete().eq('id', userId)

        if (deleteError) {
            return NextResponse.json(
                { message: deleteError.message || 'Failed to delete user' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        if (String(error).includes('SUPABASE_SERVICE_ROLE_KEY')) {
            return NextResponse.json(
                { message: 'Server configuration error' },
                { status: 503 }
            )
        }
        console.error('Delete user error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
