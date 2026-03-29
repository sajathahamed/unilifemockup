import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/env'

function getSupabaseEnv() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key || url === 'your_supabase_url') {
    throw new Error(
      'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.'
    )
  }
  return { url, key }
}

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions
 * Handles cookie management for auth session persistence
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
