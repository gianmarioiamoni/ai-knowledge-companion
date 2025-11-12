import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OAuth Callback Handler
 * 
 * This route is called by Supabase after OAuth authentication (Google, etc.)
 * It exchanges the OAuth code for a session token and sets the auth cookies.
 * 
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. Redirected to Google for authentication
 * 3. Google redirects back to /auth/callback?code=xxx
 * 4. This handler exchanges code for session token
 * 5. User is redirected to dashboard with auth cookies set
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[OAuth Callback] Received callback:', {
    code: code ? `${code.substring(0, 10)}...` : 'missing',
    origin,
    fullUrl: request.url
  })

  if (code) {
    const supabase = await createClient()
    
    try {
      // Exchange the OAuth code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[OAuth Callback] Error exchanging code:', error)
        // Redirect to login with error
        return NextResponse.redirect(`${origin}/en/auth/login?error=oauth_failed`)
      }

      console.log('[OAuth Callback] Session created successfully for user:', data.user?.email)
      
      // Success! Redirect to dashboard
      // The session cookies are automatically set by the Supabase client
      return NextResponse.redirect(`${origin}/en/dashboard`)
    } catch (error) {
      console.error('[OAuth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en/auth/login?error=unexpected`)
    }
  }

  // No code provided - invalid callback
  console.error('[OAuth Callback] No code provided in callback URL')
  return NextResponse.redirect(`${origin}/en/auth/login?error=no_code`)
}

