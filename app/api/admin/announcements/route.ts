import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/announcements — list announcements (newest first) */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const { data, error } = await client
      .from('announcements')
      .select('id, title, body, target_audience, created_at, created_by')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('Admin announcements GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/admin/announcements — create announcement */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { title, body: bodyText, target_audience } = body
    if (!title || !String(title).trim()) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 })
    }

    const client = await createClient()
    const { data, error } = await client
      .from('announcements')
      .insert({
        title: String(title).trim(),
        body: bodyText != null ? String(bodyText).trim() : '',
        target_audience: target_audience ? String(target_audience).trim() || null : null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select('id, title, body, target_audience, created_at')
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('Admin announcements POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
