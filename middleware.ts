import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Combined middleware for i18n and Supabase session management
 * 
 * Order of execution:
 * 1. Supabase session refresh (critical for OAuth redirects and cookie management)
 * 2. next-intl i18n routing (with Supabase cookies preserved)
 * 
 * Note: Supabase updateSession() always returns a response, either:
 * - NextResponse.next() with updated cookies (normal flow)
 * - NextResponse.redirect() (for auth guards)
 * 
 * We check if it's a redirect and return it immediately, otherwise we apply
 * i18n middleware and copy over the Supabase cookies.
 */
async function middleware(request: NextRequest) {
  // CRITICAL: Refresh Supabase session first (handles OAuth callback cookies)
  const supabaseResponse = await updateSession(request);
  
  // If Supabase returned a redirect (status 3xx), return it immediately
  if (supabaseResponse && supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }
  
  // Otherwise, apply i18n middleware
  const intlMiddleware = createMiddleware(routing);
  const intlResponse = intlMiddleware(request);
  
  // IMPORTANT: Copy Supabase cookies to the i18n response
  // This ensures auth cookies are preserved through the middleware chain
  if (supabaseResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
  }
  
  return intlResponse;
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|messages/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
