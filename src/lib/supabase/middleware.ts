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

  // IMPORTANT: Handle root path redirect to default locale
  // This must happen before any other logic to avoid 404
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/en' // redirect to default locale
    return NextResponse.redirect(url)
  }

  // Check if we're on a public route that doesn't require auth
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
  ]
  
  // Extract the locale and path
  const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})/)
  const locale = localeMatch ? localeMatch[1] : 'en' // default to 'en' if no locale
  const pathWithoutLocale = request.nextUrl.pathname.replace(/^\/[a-z]{2}/, '') || '/'
  const isPublicRoute = publicRoutes.includes(pathWithoutLocale)

  // If no user and trying to access protected route, redirect to login (with locale)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth/login`
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard (with locale)
  if (user && (pathWithoutLocale === '/auth/login' || pathWithoutLocale === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
