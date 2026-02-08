// Only export browser client from this file
// Server clients should be imported directly from './supabase/server'
export { createClient as createBrowserClient } from './supabase/client'

// Auth types (these don't import server code)
export type { UserRole, UserProfile } from './auth'
export { getRoleBasedRedirect, hasRoleAccess } from './auth'

