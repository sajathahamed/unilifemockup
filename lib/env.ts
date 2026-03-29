/**
 * Environment variable helpers for Next.js / Expo compatibility.
 * Reads from NEXT_PUBLIC_*, EXPO_PUBLIC_*, or server-only vars.
 */

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    ''
  )
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    ''
  )
}

export function getGooglePlacesApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ??
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY ??
    ''
  )
}
