import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password']

// Role-based route prefixes (no generic vendor - only vendor-food, vendor-laundry)
const roleRoutes: Record<string, string[]> = {
  student: ['/student'],
  lecturer: ['/lecturer'],
  admin: ['/admin'],
  'vendor-food': ['/vendor'],
  'vendor-laundry': ['/vendor'],
  delivery: ['/delivery'],
  super_admin: ['/super-admin', '/admin', '/vendor', '/delivery', '/student', '/lecturer'],
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
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const role = (user.user_metadata?.role as string) || ''
      if (role) {
        const rolePrefix = normalizeRolePrefix(role)
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

  let userRole: string = (user.user_metadata?.role as string) || ''

  // Fetch role from DB when Supabase is available
  if (supabase) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()
    if (userData?.role && !userError) userRole = userData.role as string
  }

  if (!userRole) {
    return NextResponse.redirect(new URL('/login?error=profile_not_found', request.url))
  }

  const allowedPrefixes = roleRoutes[userRole] || []
  let hasAccess = allowedPrefixes.some(prefix => pathname.startsWith(prefix))

  // vendor-food: cannot access laundry pages
  if (userRole === 'vendor-food' && pathname.startsWith('/vendor/laundry')) {
    hasAccess = false
  }
  // vendor-laundry: cannot access food orders page
  if (userRole === 'vendor-laundry' && pathname === '/vendor/orders') {
    hasAccess = false
  }

  if (!hasAccess) {
    const rolePrefix = normalizeRolePrefix(userRole)
    return NextResponse.redirect(new URL(`/${rolePrefix}/dashboard`, request.url))
  }

  if (pathname === '/') {
    const rolePrefix = normalizeRolePrefix(userRole)
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
