import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleBasedRedirect, UserRole } from '@/lib/auth'

/**
 * Home page - redirects based on auth status
 * - Authenticated users go to their role-based dashboard
 * - Unauthenticated users go to login
 */
export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Fetch user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userData?.role) {
      redirect(getRoleBasedRedirect(userData.role as UserRole))
    }
  }
  
  // Redirect to login for unauthenticated users
  redirect('/login')
}
