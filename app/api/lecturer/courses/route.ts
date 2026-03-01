import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/courses
 * Fetches all available courses
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
            .from('courses')
            .select('id, course_code, course_name, colour')
            .order('course_code', { ascending: true })

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json(
                { message: error.message || 'Failed to fetch courses' },
                { status: 400 }
            )
        }

        return NextResponse.json(data || [], { status: 200 })
    } catch (error) {
        console.error('Get courses error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}
