import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth.server'
import { deleteUser } from '@/lib/supabase/admin'

/**
 * DELETE /api/admin/users/[id]
 * Requires admin or super_admin role
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authorization
        const user = await requireRole('admin')
        
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = parseInt(params.id)

        if (isNaN(userId)) {
            return NextResponse.json(
                { message: 'Invalid user ID' },
                { status: 400 }
            )
        }

        // Delete the user
        const result = await deleteUser(userId)

        if (!result.success) {
            return NextResponse.json(
                { message: result.error || 'Failed to delete user' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
