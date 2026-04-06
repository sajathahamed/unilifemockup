import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_SETTINGS: Record<string, string> = {
  app_name: 'UniLife',
  support_email: 'support@unilife.edu',
  maintenance_mode: 'false',
  maintenance_message: 'The system will be undergoing scheduled maintenance.',
  maintenance_start_time: '',
  maintenance_end_time: '',
  allow_registration: 'true',
  session_timeout_minutes: '60',
}

async function fetchSettingsFromDb(): Promise<Record<string, string> | null> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from('system_settings').select('key, value')
    if (!error && data && data.length > 0) {
      const settings: Record<string, string> = { ...DEFAULT_SETTINGS }
      for (const row of data) {
        settings[row.key] = row.value ?? ''
      }
      return settings
    }
  } catch {
    // Service role key missing or table missing — try session client (RLS allows read)
  }
  try {
    const client = await createClient()
    const { data, error } = await client.from('system_settings').select('key, value')
    if (!error && data && data.length > 0) {
      const settings: Record<string, string> = { ...DEFAULT_SETTINGS }
      for (const row of data) {
        settings[row.key] = row.value ?? ''
      }
      return settings
    }
  } catch {
    // ignore
  }
  return null
}

/** GET /api/super-admin/settings — returns all key-value settings (super_admin only). Returns defaults on error so UI always loads. */
export async function GET() {
  try {
    const user = await verifyRole('super_admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const settings = await fetchSettingsFromDb()
    if (settings) return NextResponse.json(settings)
    return NextResponse.json({ ...DEFAULT_SETTINGS, _defaults: true })
  } catch (e) {
    console.error('Super-admin settings GET error:', e)
    return NextResponse.json({ ...DEFAULT_SETTINGS, _defaults: true })
  }
}

/** PATCH /api/super-admin/settings — update settings (super_admin only). Body: { app_name?, support_email?, maintenance_mode?, allow_registration?, session_timeout_minutes? } */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('super_admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const keys = [
      'app_name',
      'support_email',
      'maintenance_mode',
      'maintenance_message',
      'maintenance_start_time',
      'maintenance_end_time',
      'allow_registration',
      'session_timeout_minutes'
    ]
    const rows = keys
      .filter((k) => body[k] !== undefined)
      .map((key) => ({ key, value: String(body[key]) }))

    if (rows.length === 0) {
      return NextResponse.json({ message: 'No valid keys to update' }, { status: 400 })
    }

    try {
      const admin = getAdminClient()
      const { error } = await admin.from('system_settings').upsert(rows, { onConflict: 'key' })
      if (error) {
        return NextResponse.json(
          { message: 'Settings table missing or error. Run migration 20250307000000_system_settings.sql in Supabase.' },
          { status: 503 }
        )
      }
      return NextResponse.json({ ok: true })
    } catch (e) {
      return NextResponse.json(
        { message: 'Add SUPABASE_SERVICE_ROLE_KEY (JWT from Supabase Dashboard → API → service_role) to save settings.' },
        { status: 503 }
      )
    }
  } catch (e) {
    console.error('Super-admin settings PATCH error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
