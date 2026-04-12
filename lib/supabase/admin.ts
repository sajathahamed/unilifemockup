import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Returns true if the service role key looks usable (long JWT).
 * Supabase service_role key is a long JWT starting with "eyJ" (from Dashboard → Settings → API → service_role).
 */
function isValidServiceKey(key?: string): boolean {
    if (!key || key.length < 100) return false
    // Must be the JWT format Supabase uses (starts with eyJ...)
    if (key.startsWith('eyJ')) return true
    // Allow other long keys in case Supabase changes format
    return key.length > 150
}

/** Admin Supabase client (bypasses RLS). Use only in server-side super-admin flows. */
export function getAdminClient() {
    if (!isValidServiceKey(serviceRoleKey)) throw new Error('SUPABASE_SERVICE_ROLE_KEY required')
    return createSupabaseClient(supabaseUrl, serviceRoleKey!, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
}

export type UserRow = {
    id: number
    auth_id: string | null
    name: string
    email: string
    role: string
    uni_id: number | null
    created_at: string
    /** When false, account is soft-deactivated (login may still be blocked separately). */
    is_active?: boolean | null
}

/**
 * Fetches all users for admin/super-admin pages.
 * - If a valid service role key exists: uses admin client (bypasses RLS)
 * - Otherwise: falls back to session client (may be RLS limited)
 */
export async function fetchAllUsers(): Promise<UserRow[]> {
    // PATH 1: Service role key available — bypass RLS
    if (isValidServiceKey(serviceRoleKey)) {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey!, {
            auth: { autoRefreshToken: false, persistSession: false },
        })
        const { data, error } = await adminClient
            .from('users')
            .select('id, auth_id, name, email, role, uni_id, created_at, is_active')
            .order('created_at', { ascending: false })
        if (!error && data && data.length >= 0) return data as UserRow[]
    }

    // PATH 2: Fallback — session client (RLS may limit rows)
    const sessionClient = await createClient()
    const { data } = await sessionClient
        .from('users')
        .select('id, auth_id, name, email, role, uni_id, created_at, is_active')
        .order('created_at', { ascending: false })
    return (data || []) as UserRow[]
}

/**
 * Fetches all users for super-admin only. Always tries admin client first so RLS is bypassed and every row is returned.
 * If SUPABASE_SERVICE_ROLE_KEY is missing/invalid, falls back to session (limited by RLS).
 */
export async function fetchAllUsersForSuperAdmin(): Promise<{ users: UserRow[]; limited: boolean }> {
    try {
        const admin = getAdminClient()
        const { data, error } = await admin
            .from('users')
            .select('id, auth_id, name, email, role, uni_id, created_at, is_active')
            .order('created_at', { ascending: false })
        if (!error && data) return { users: data as UserRow[], limited: false }
    } catch {
        // Service role key missing or query failed
    }
    const sessionClient = await createClient()
    const { data } = await sessionClient
        .from('users')
        .select('id, auth_id, name, email, role, uni_id, created_at, is_active')
        .order('created_at', { ascending: false })
    return { users: (data || []) as UserRow[], limited: true }
}

export type VendorAccountRow = { id: number; name: string; email: string }

/**
 * Vendor users for admin stall/shop assignment. Uses service role when configured (bypasses RLS).
 */
export async function fetchVendorAccountsForAdmin(
    role: 'vendor-food' | 'vendor-laundry'
): Promise<VendorAccountRow[]> {
    if (isValidServiceKey(serviceRoleKey)) {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey!, {
            auth: { autoRefreshToken: false, persistSession: false },
        })
        const { data, error } = await adminClient
            .from('users')
            .select('id, name, email')
            .eq('role', role)
            .order('name', { ascending: true })
        if (!error && data) return data as VendorAccountRow[]
    }
    const sessionClient = await createClient()
    const { data } = await sessionClient
        .from('users')
        .select('id, name, email')
        .eq('role', role)
        .order('name', { ascending: true })
    return (data || []) as VendorAccountRow[]
}

/**
 * Ensures the email belongs to a user with the expected vendor role (for API validation).
 */
export async function assertUserHasVendorRole(
    email: string,
    role: 'vendor-food' | 'vendor-laundry'
): Promise<{ ok: true } | { ok: false; message: string }> {
    const normalized = email.trim().toLowerCase()
    const label = role === 'vendor-food' ? 'food vendor' : 'laundry vendor'
    const notFound = {
        ok: false as const,
        message: `Owner must be a ${label} account created in Super Admin.`,
    }

    if (isValidServiceKey(serviceRoleKey)) {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey!, {
            auth: { autoRefreshToken: false, persistSession: false },
        })
        const { data, error } = await adminClient
            .from('users')
            .select('id')
            .eq('email', normalized)
            .eq('role', role)
            .maybeSingle()
        if (error) return { ok: false, message: 'Could not verify owner account.' }
        if (!data) return notFound
        return { ok: true }
    }

    const sessionClient = await createClient()
    const { data, error } = await sessionClient
        .from('users')
        .select('id')
        .eq('email', normalized)
        .eq('role', role)
        .maybeSingle()
    if (error) return { ok: false, message: 'Could not verify owner account.' }
    if (!data) return notFound
    return { ok: true }
}
