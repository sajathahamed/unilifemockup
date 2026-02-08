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

  // Fetch user profile from users table using auth_id
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return profile as UserProfile
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
export async function requireRole(requiredRole: UserRole): Promise<UserProfile> {
  const user = await requireAuth()
  
  if (!hasRoleAccess(user.role, requiredRole)) {
    redirect(getRoleBasedRedirect(user.role))
  }
  
  return user
}
