import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/** Supabase session refresh / cookie clearing happens on `sessionResponse`; copy onto redirects or those headers are lost. */
function redirectWithSessionCookies(
  sessionResponse: NextResponse,
  url: URL | string
): NextResponse {
  const redirect = NextResponse.redirect(url)
  sessionResponse.cookies.getAll().forEach((c) => {
    redirect.cookies.set(c.name, c.value, {
      domain: c.domain,
      expires: c.expires,
      httpOnly: c.httpOnly,
      maxAge: c.maxAge,
      path: c.path,
      partitioned: c.partitioned,
      priority: c.priority,
      sameSite: c.sameSite,
      secure: c.secure,
    })
  })
  return redirect
}

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password', '/trip-planner']

const roleRoutes: Record<string, string[]> = {
  student: ['/student'],
  lecturer: ['/student'],
  admin: ['/admin'],
  vendor: ['/vendor'],
  delivery: ['/delivery'],
  super_admin: ['/super-admin', '/admin', '/vendor', '/delivery', '/student'],
}

function dashboardPathForRole(role: string): string {
  if (role === 'super_admin') return '/super-admin/dashboard'
  if (role === 'lecturer') return '/student/dashboard'
  return `/${role}/dashboard`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.includes('/api/')) {
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const role = (user.user_metadata?.role as string) || ''
      if (role) {
        const rolePrefix = normalizeRolePrefix(role)
        return redirectWithSessionCookies(
          supabaseResponse,
          new URL(`/${rolePrefix}/dashboard`, request.url)
        )
      }
    }
    return supabaseResponse
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return redirectWithSessionCookies(supabaseResponse, loginUrl)
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  let userRole = (userData?.role as string) || (user.user_metadata?.role as string) || ''

  if (!userRole) {
    return redirectWithSessionCookies(
      supabaseResponse,
      new URL('/login?error=profile_not_found', request.url)
    )
  }

  const allowedPrefixes = roleRoutes[userRole] || []
  const sharedRoutes = ['/trip-planner']
  const isSharedRoute = sharedRoutes.some((route) => pathname.startsWith(route))
  const hasAccess = isSharedRoute || allowedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!hasAccess) {
    const rolePrefix = normalizeRolePrefix(userRole)
    return redirectWithSessionCookies(
      supabaseResponse,
      new URL(`/${rolePrefix}/dashboard`, request.url)
    )
  }

  if (pathname === '/') {
    const rolePrefix = normalizeRolePrefix(userRole)
    return redirectWithSessionCookies(
      supabaseResponse,
      new URL(`/${rolePrefix}/dashboard`, request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
