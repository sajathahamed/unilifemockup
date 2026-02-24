import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password']

// Role-based route prefixes
const roleRoutes: Record<string, string[]> = {
  student: ['/student'],
  lecturer: ['/lecturer'],
  admin: ['/admin'],
  vendor: ['/vendor'],
  delivery: ['/delivery'],
  super_admin: ['/super-admin', '/admin', '/vendor', '/delivery', '/student', '/lecturer'], // Super admin can access all
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`>>> Middleware: ${request.method} ${pathname}`)

  // 1. Bypass all API routes — they handle their own auth
  if (pathname.includes('/api/')) {
    console.log(`>>> Bypassing API: ${pathname}`)
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)



  // 2. Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If user is already logged in and tries to access auth pages, redirect to dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      // Fetch user role using auth_id
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single()

      if (userData?.role) {
        const rolePrefix = userData.role === 'super_admin' ? 'super-admin' : userData.role
        return NextResponse.redirect(new URL(`/${rolePrefix}/dashboard`, request.url))
      }
    }
    return supabaseResponse
  }

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Fetch user role for protected routes using auth_id
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (error || !userData) {
    // User exists in auth but not in users table - redirect to login
    return NextResponse.redirect(new URL('/login?error=profile_not_found', request.url))
  }

  const userRole = userData.role as string
  const allowedPrefixes = roleRoutes[userRole] || []

  // Check if user has access to the requested route
  const hasAccess = allowedPrefixes.some(prefix => pathname.startsWith(prefix))

  if (!hasAccess) {
    // Redirect to user's own dashboard
    const rolePrefix = userRole === 'super_admin' ? 'super-admin' : userRole
    return NextResponse.redirect(new URL(`/${rolePrefix}/dashboard`, request.url))
  }

  // Root path - redirect to appropriate dashboard
  if (pathname === '/') {
    const rolePrefix = userRole === 'super_admin' ? 'super-admin' : userRole
    return NextResponse.redirect(new URL(`/${rolePrefix}/dashboard`, request.url))
  }

  return supabaseResponse
}
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images in public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
