import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/admin/users
 * Admin only. Creates a new user (auth + profile) without changing the current session.
 * Body: { name, email, password, role, uni_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('super_admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { name, email, password, role, uni_id } = body
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields: name, email, password, role' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const admin = getAdminClient()

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: String(email).trim(),
      password: String(password),
      email_confirm: true,
      user_metadata: { name: String(name).trim(), role },
    })

    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: 400 })
    }
    if (!authData.user) {
      return NextResponse.json({ message: 'Failed to create auth user' }, { status: 500 })
    }

    const { error: profileError } = await admin.from('users').insert({
      auth_id: authData.user.id,
      email: String(email).trim(),
      name: String(name).trim(),
      role: String(role),
      uni_id: uni_id != null && uni_id !== '' ? parseInt(String(uni_id), 10) : null,
    })

    if (profileError) {
      try {
        await admin.auth.admin.deleteUser(authData.user.id)
      } catch {
        // ignore
      }
      return NextResponse.json({ message: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: `Account created for ${name}` })
  } catch (e) {
    if (String(e).includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json({ message: 'Server configuration error' }, { status: 503 })
    }
    console.error('Admin create user error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
