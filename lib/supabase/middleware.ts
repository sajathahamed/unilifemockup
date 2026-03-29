import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase auth session in middleware
 * This ensures cookies are refreshed and session stays valid
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'your_supabase_url') {
    return { supabaseResponse, user: null, supabase: null }
  }

  const cookieHandlers = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      supabaseResponse = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options ?? {})
      )
    },
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: cookieHandlers,
    })

    const { data: { user } } = await supabase.auth.getUser()
    return { supabaseResponse, user, supabase }
  } catch (e) {
    // Stale/invalid refresh token (common after deploy, env change, or token expiry): clear auth cookies
    // so the next request doesn't resend them. Works in Vercel Edge and local.
    const code = e && typeof e === 'object' && 'code' in e ? (e as { code?: string }).code : undefined
    if (code === 'refresh_token_not_found') {
      try {
        const supabase = createServerClient(url, key, {
          cookies: cookieHandlers,
        })
        await supabase.auth.signOut()
      } catch {
        // signOut can fail on Edge (e.g. network); still clear cookies below
      }
      // Manually clear Supabase auth cookies so browser stops sending them (reliable on Vercel Edge)
      const clearOptions = { maxAge: 0, path: '/' }
      request.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-') && name.includes('auth-token')) {
          supabaseResponse.cookies.set(name, '', clearOptions)
        }
      })
    }
    return { supabaseResponse, user: null, supabase: null }
  }
}
