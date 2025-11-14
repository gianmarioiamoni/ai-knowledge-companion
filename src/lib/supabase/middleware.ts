import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if we're on a public route that doesn't require auth
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
  ]
  
  // Extract the locale and path
  // Always do the replacement, regardless of whether there's a locale match
  const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})/)
  const locale = localeMatch ? localeMatch[1] : 'en'
  const pathWithoutLocale = request.nextUrl.pathname.replace(/^\/[a-z]{2}/, '') || '/'
  const isPublicRoute = publicRoutes.includes(pathWithoutLocale)

  // DEBUG: Add headers to see what's happening (visible in browser Network tab)
  supabaseResponse.headers.set('X-Debug-Pathname', request.nextUrl.pathname)
  supabaseResponse.headers.set('X-Debug-Locale', locale)
  supabaseResponse.headers.set('X-Debug-PathWithoutLocale', pathWithoutLocale)
  supabaseResponse.headers.set('X-Debug-IsPublicRoute', String(isPublicRoute))
  supabaseResponse.headers.set('X-Debug-HasUser', String(!!user))
  supabaseResponse.headers.set('X-Debug-LocaleMatch', String(!!localeMatch))

  // If no user and trying to access protected route, redirect to login (with locale)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth/login`
    const redirectResponse = NextResponse.redirect(url)
    
    // Add debug headers to redirect response too
    redirectResponse.headers.set('X-Debug-Action', 'REDIRECT-TO-LOGIN')
    redirectResponse.headers.set('X-Debug-Reason', 'no-user-protected-route')
    redirectResponse.headers.set('X-Debug-PathWithoutLocale', pathWithoutLocale)
    
    return redirectResponse
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard (with locale)
  if (user && (pathWithoutLocale === '/auth/login' || pathWithoutLocale === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    const redirectResponse = NextResponse.redirect(url)
    
    // Add debug headers to redirect response too
    redirectResponse.headers.set('X-Debug-Action', 'REDIRECT-TO-DASHBOARD')
    redirectResponse.headers.set('X-Debug-Reason', 'user-on-auth-page')
    
    return redirectResponse
  }

  // Add success header
  supabaseResponse.headers.set('X-Debug-Action', 'ALLOW-ACCESS')

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
