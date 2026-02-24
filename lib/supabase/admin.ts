import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Returns true only if the service role key looks like a valid JWT
 * (not a URL or placeholder)
 */
function isValidServiceKey(key?: string): boolean {
    return !!key && key.startsWith('eyJ') && key.length > 100
}

/**
 * Fetches all users for admin/super-admin pages.
 * - If a valid service role key exists: uses Auth Admin API (bypasses RLS entirely)
 * - Otherwise: falls back to a direct query via the current user's session
 */
export async function fetchAllUsers(): Promise<{
    id: number
    auth_id: string | null
    name: string
    email: string
    role: string
    uni_id: number | null
    created_at: string
}[]> {
    // --- PATH 1: Service role key available — use Auth Admin API ---
    if (isValidServiceKey(serviceRoleKey)) {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey!, {
            auth: { autoRefreshToken: false, persistSession: false },
        })

        // Pull all rows directly from public.users (RLS bypassed)
        const { data, error } = await adminClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) return data
    }

    // --- PATH 2: No valid service role key — query via session (may be RLS limited) ---
    const sessionClient = await createClient()
    const { data } = await sessionClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    return data || []
}
