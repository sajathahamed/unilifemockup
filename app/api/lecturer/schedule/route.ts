import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lecturer/schedule
 * Fetches the lecturer's course schedule/timetable with course details.
 * Query: ?academic_year=2024-2025 to filter by academic year.
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

        const academicYear = request.nextUrl.searchParams.get('academic_year')?.trim() || null

        const client = await createClient()
        
        let query = client
            .from('timetable')
            .select('*, courses(course_code, course_name, colour)')
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true })

        if (academicYear) {
            query = query.eq('academic_year', academicYear)
        }

        const { data, error } = await query

        if (error) throw error

        // Flatten: Supabase returns { ..., courses: { course_code, course_name, colour } }
        const rows = (data || []).map((row: Record<string, unknown>) => {
            const courses = row.courses as { course_code?: string; course_name?: string; colour?: string } | null
            const { courses: _, ...rest } = row
            // Normalize day_of_week and pad start_time
            let day_of_week = rest.day_of_week
            if (typeof day_of_week === 'string' && day_of_week.length > 0) {
                day_of_week = day_of_week.charAt(0).toUpperCase() + day_of_week.slice(1).toLowerCase()
            }
            let start_time = rest.start_time
            if (typeof start_time === 'string' && start_time.length > 0 && start_time.length < 5) {
                start_time = start_time.padStart(5, '0')
            }
            return {
                ...rest,
                day_of_week,
                start_time,
                course_code: courses?.course_code ?? null,
                course_name: courses?.course_name ?? null,
                colour: courses?.colour ?? null,
            }
        })

        return NextResponse.json(rows, { status: 200 })
    } catch (error) {
        console.error('Get schedule error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/lecturer/schedule
 * Creates a new timetable entry
 */
export async function POST(request: NextRequest) {
    try {
        const user = await verifyRole('lecturer')

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        const { academic_year, course_id, day_of_week, start_time, end_time, location } = body

        if (!academic_year || !course_id || !day_of_week || !start_time || !end_time) {
            return NextResponse.json(
                { message: 'Missing required fields: academic_year, course_id, day_of_week, start_time, end_time' },
                { status: 400 }
            )
        }

        const client = await createClient()

        const { data, error } = await client
            .from('timetable')
            .insert({
                academic_year,
                course_id,
                day_of_week,
                start_time,
                end_time,
                location,
            })
            .select()

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json(
                { message: error.message || 'Failed to create schedule in database' },
                { status: 400 }
            )
        }

        return NextResponse.json(data?.[0], { status: 201 })
    } catch (error) {
        console.error('Create schedule error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}
