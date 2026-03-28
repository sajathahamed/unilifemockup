import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import { UserProfile, UserRole, getRoleBasedRedirect, hasRoleAccess } from './auth'
import { RequiredRole } from './auth'

/**
 * Get the currently authenticated user with their profile
 * Returns null if not authenticated or on any server/Supabase error (avoids breaking RSC fetch)
 * SERVER ONLY - Do not import in client components
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Source of Truth: Fetch user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (profile && !profileError) {
      return profile as UserProfile
    }

    // Fallback: use metadata if DB query fails (RLS, missing record, or network)
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
  } catch (e) {
    // Avoid breaking RSC payload: log and return null so requireAuth can redirect to login
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCurrentUser]', e)
    }
    return null
  }
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
 * SERVER ONLY - Use in Server Components and Route Handlers
 */
export async function requireRole(requiredRole: RequiredRole): Promise<UserProfile> {
  const user = await requireAuth()

  if (!hasRoleAccess(user.role, requiredRole)) {
    redirect(getRoleBasedRedirect(user.role))
  }

  return user
}

/**
 * Role check for API routes - returns null if not authorized (no redirect).
 * Use this in API route handlers to return 403 JSON instead of redirecting.
 */
export async function verifyRole(requiredRole: RequiredRole): Promise<UserProfile | null> {
  const user = await getCurrentUser()
  if (!user || !hasRoleAccess(user.role, requiredRole)) return null
  return user
}
