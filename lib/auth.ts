// User roles as defined in the database (no generic 'vendor' - only vendor-food and vendor-laundry)
export type UserRole = 'student' | 'lecturer' | 'admin' | 'vendor-food' | 'vendor-laundry' | 'delivery' | 'super_admin'

/** Role required for route protection - 'vendor' means any vendor subtype (vendor-food, vendor-laundry) */
export type RequiredRole = UserRole | 'vendor'

// User profile from the users table (matches database schema)
export interface UserProfile {
  id: number
  auth_id: string // Links to Supabase auth.users.id
  name: string
  email: string
  role: UserRole
  uni_id?: number
  created_at: string
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(role: UserRole): string {
  const roleRoutes: Record<UserRole, string> = {
    student: '/student/dashboard',
    lecturer: '/lecturer/dashboard',
    admin: '/admin/dashboard',
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
export function hasRoleAccess(userRole: UserRole, requiredRole: RequiredRole): boolean {
  if (userRole === 'super_admin') return true
  // 'vendor' required = any vendor subtype (vendor-food, vendor-laundry)
  if (requiredRole === 'vendor') {
    return userRole === 'vendor-food' || userRole === 'vendor-laundry'
  }
  return userRole === requiredRole
}
