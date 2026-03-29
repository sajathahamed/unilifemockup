import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password']

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
      const metaRole = user.user_metadata?.role as string | undefined
      if (metaRole) {
        return NextResponse.redirect(new URL(dashboardPathForRole(metaRole), request.url))
      }
    }
    return supabaseResponse
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  let userRole = (userData?.role as string) || (user.user_metadata?.role as string) || ''

  if (!userRole) {
    return NextResponse.redirect(new URL('/login?error=profile_not_found', request.url))
  }

  const allowedPrefixes = roleRoutes[userRole] || []
  const sharedRoutes = ['/trip-planner']
  const isSharedRoute = sharedRoutes.some((route) => pathname.startsWith(route))
  const hasAccess = isSharedRoute || allowedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!hasAccess) {
    return NextResponse.redirect(new URL(dashboardPathForRole(userRole), request.url))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(dashboardPathForRole(userRole), request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
