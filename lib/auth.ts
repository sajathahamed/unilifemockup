// User roles as defined in the database
export type UserRole = 'student' | 'lecturer' | 'admin' | 'vendor' | 'delivery' | 'super_admin'

// User profile from the users table (matches database schema)
export interface UserProfile {
  id: number
  auth_id: string // Links to Supabase auth.users.id
  name: string
  email: string
  role: UserRole
  uni_id?: number | null
  program_id?: number | null
  semester_id?: number | null
  active_university_id?: number | null
  created_at: string
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(role: UserRole): string {
  const roleRoutes: Record<UserRole, string> = {
    student: '/student/dashboard',
    lecturer: '/student/dashboard',
    admin: '/admin/dashboard',
    vendor: '/vendor/dashboard',
    delivery: '/delivery/dashboard',
    super_admin: '/super-admin/dashboard',
  }
  
  return roleRoutes[role] || '/login'
}

/**
 * Check if a user has access to a specific role's routes
 */
export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === 'super_admin') return true
  /* Legacy lecturer accounts use the same student app surfaces */
  if (requiredRole === 'student' && userRole === 'lecturer') return true
  return userRole === requiredRole
}
