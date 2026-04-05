import { createClient } from '@/lib/supabase/server'
import { getRoleBasedRedirect, UserRole } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler
 * Handles the redirect from Supabase OAuth providers (Google)
 * Creates user profile if it's a new signup
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const isSignup = searchParams.get('signup') === 'true'
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    if (user) {
      // Check if user profile exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('User fetch error:', fetchError)
        return NextResponse.redirect(`${origin}/login?error=profile_error`)
      }

      if (existingUser) {
        // Existing user - redirect to their dashboard
        const redirectPath = getRoleBasedRedirect(existingUser.role as UserRole)
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }

      // New OAuth user - need to create profile
      // For Google OAuth, we need to complete registration with role selection
      if (isSignup || !existingUser) {
        // Create a default student profile for OAuth users
        // They can change their role later in settings
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            auth_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'student', // Default role for OAuth signups
          })

        if (insertError) {
          console.error('Profile creation error:', insertError)
          return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`)
        }

        // Redirect new user to student dashboard
        return NextResponse.redirect(`${origin}/student/dashboard`)
      }
    }
  }

  // Fallback - redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
