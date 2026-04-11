// User roles as defined in the database
export type UserRole = 'student' | 'lecturer' | 'admin' | 'vendor' | 'vendor-food' | 'vendor-laundry' | 'delivery' | 'super_admin'

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
    'vendor-food': '/vendor/dashboard',
    'vendor-laundry': '/vendor/dashboard',
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
  // lecturer is effectively a student for now
  if (userRole === 'lecturer' && requiredRole === 'student') return true
  // vendor-food and vendor-laundry can access vendor routes
  if (userRole === 'vendor-food' || userRole === 'vendor-laundry') {
    if (requiredRole === 'vendor' || requiredRole === 'vendor-food' || requiredRole === 'vendor-laundry') return true
  }
  if (requiredRole === 'vendor' && (userRole === 'vendor-food' || userRole === 'vendor-laundry')) return true
  // Otherwise, must match exactly
  return userRole === requiredRole
}
