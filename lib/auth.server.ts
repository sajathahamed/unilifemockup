import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import { UserProfile, UserRole, getRoleBasedRedirect, hasRoleAccess } from './auth'

/**
 * Get the currently authenticated user with their profile
 * Returns null if not authenticated
 * SERVER ONLY - Do not import in client components
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Source of Truth: Fetch user profile from users table
  // This is where roles are usually updated
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  // If DB query worked, return that profile (most accurate)
  if (profile && !profileError) {
    return profile as UserProfile
  }

  // Fallback: If DB query fails (due to RLS or missing record), use metadata
  if (user.user_metadata?.role && user.user_metadata?.name) {
    return {
      auth_id: user.id,
      email: user.email!,
      name: user.user_metadata.name,
      role: user.user_metadata.role as UserRole,
      created_at: user.created_at,
      id: -1,
      uni_id: user.user_metadata.uni_id || null
    } as UserProfile
  }

  return null
}

/**
 * Protected route helper - redirects to login if not authenticated
 * SERVER ONLY - Use in Server Components and Route Handlers
 */
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Role-protected route helper - redirects if user doesn't have required role
 * SERVER ONLY - Use in Server Components and Page Routes
 */
export async function requireRole(requiredRole: UserRole): Promise<UserProfile> {
  const user = await requireAuth()

  if (!hasRoleAccess(user.role, requiredRole)) {
    redirect(getRoleBasedRedirect(user.role))
  }

  return user
}

/**
 * API-safe authentication check - returns null instead of redirecting
 * Use in API routes instead of requireAuth()
 * Returns null if not authenticated
 */
export async function verifyAuth(): Promise<UserProfile | null> {
  return getCurrentUser()
}

/**
 * API-safe role verification - returns null instead of redirecting
 * Use in API routes instead of requireRole()
 * Returns null if not authenticated or doesn't have required role
 */
export async function verifyRole(requiredRole: UserRole): Promise<UserProfile | null> {
  const user = await verifyAuth()

  if (!user) {
    return null
  }

  if (!hasRoleAccess(user.role, requiredRole)) {
    return null
  }

  return user
}
