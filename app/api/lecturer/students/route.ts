import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

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

        const client = await createClient()

        const { data, error } = await client
            .from('users')
            .select('id, name, email')
            .eq('role', 'student')
            .order('name', { ascending: true })

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json(
                { message: error.message || 'Failed to fetch students' },
                { status: 400 }
            )
        }

        return NextResponse.json(data || [], { status: 200 })
    } catch (error) {
        console.error('Get students error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}
