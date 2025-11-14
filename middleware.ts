import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Combined middleware for i18n and Supabase session management
 * 
 * Order of execution:
 * 1. next-intl i18n routing (handles locale redirects first)
 * 2. Supabase session refresh and auth guards (only after locale is determined)
 * 
 * This order is critical:
 * - i18n must process locale redirects BEFORE auth checks
 * - Otherwise, / -> /en redirect happens AFTER auth redirect, causing loops
 */
async function middleware(request: NextRequest) {
  // Step 1: Apply i18n middleware first to handle locale redirects
  const intlMiddleware = createMiddleware(routing);
  const intlResponse = intlMiddleware(request);
  
  // If i18n returned a redirect (e.g., / -> /en), return it immediately
  // The auth check will happen on the next request with the correct locale
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }
  
  // Step 2: Apply Supabase middleware for auth checks
  // At this point, the request has the correct locale
  const supabaseResponse = await updateSession(request);
  
  // If Supabase returned a redirect (auth guard), return it
  if (supabaseResponse && supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }
  
  // Step 3: Merge cookies from both middlewares
  // Copy Supabase session cookies to the i18n response
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
     * - manifest.webmanifest (PWA manifest)
     * - robots.txt, sitemap.xml (SEO files)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|messages/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
