import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/lecturer/schedule/[id]
 * Updates a timetable entry
 */
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyRole('lecturer')

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await context.params
        const scheduleId = parseInt(id, 10)
        if (isNaN(scheduleId)) {
            return NextResponse.json(
                { message: 'Invalid schedule ID' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { academic_year, course_id, day_of_week, start_time, end_time, location } = body

        const client = await createClient()

        const { data, error } = await client
            .from('timetable')
            .update({
                academic_year,
                course_id,
                day_of_week,
                start_time,
                end_time,
                location,
            })
            .eq('id', scheduleId)
            .select()

        if (error) {
            console.error('Supabase update error:', error)
            return NextResponse.json(
                { message: error.message || 'Failed to update schedule in database' },
                { status: 400 }
            )
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'Schedule not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(data[0], { status: 200 })
    } catch (error) {
        console.error('Update schedule error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/lecturer/schedule/[id]
 * Deletes a timetable entry
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyRole('lecturer')

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await context.params
        const scheduleId = parseInt(id, 10)
        if (isNaN(scheduleId)) {
            return NextResponse.json(
                { message: 'Invalid schedule ID' },
                { status: 400 }
            )
        }

        const client = await createClient()

        const { error } = await client
            .from('timetable')
            .delete()
            .eq('id', scheduleId)

        if (error) {
            console.error('Supabase delete error:', error)
            return NextResponse.json(
                { message: error.message || 'Failed to delete schedule from database' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Schedule deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Delete schedule error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}
