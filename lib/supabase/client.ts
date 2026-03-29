import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/env'

/**
 * Creates a Supabase client for use in Client Components
 * This client handles auth state and cookie management automatically
 */
export function createClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) throw new Error('Missing Supabase config (NEXT_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL and keys)')
  return createBrowserClient(url, key)
}
