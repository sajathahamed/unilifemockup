import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRole } from '@/lib/auth.server'
import { validateStudentPhone } from '@/lib/student-phone'

export async function POST(req: Request) {
  try {
    // Same access as /student/profile page: student + lecturer (see hasRoleAccess).
    const user = await verifyRole('student')
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { mobile } = await req.json()
    if (mobile == null || typeof mobile !== 'string') {
      return NextResponse.json({ message: 'Mobile number required' }, { status: 400 })
    }

    const phoneCheck = validateStudentPhone(mobile)
    if (!phoneCheck.ok) {
      return NextResponse.json({ message: phoneCheck.message }, { status: 400 })
    }

    if (!user.id || user.id < 1) {
      return NextResponse.json(
        {
          message:
            'Your account is not linked to a student record yet. Try signing out and back in, or contact support.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // student_phones columns: id, user_id, mobile, verified, created_at (no updated_at)
    const { error } = await supabase.from('student_phones').upsert(
      {
        user_id: user.id,
        mobile: phoneCheck.normalized,
      },
      { onConflict: 'user_id' }
    )

    if (error) throw error

    return NextResponse.json({
      message: 'Saved successfully',
      mobile: phoneCheck.normalized,
    })
  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json({ message: error.message || 'Error saving profile' }, { status: 500 })
  }
}
