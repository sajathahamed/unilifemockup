import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { fetchStudents } from '@/lib/supabase/admin'

/**
 * GET /api/lecturer/students
 * Fetches all students for course selection (for timetable creation)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await verifyRole('lecturer')

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const data = await fetchStudents()
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Get students error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}
