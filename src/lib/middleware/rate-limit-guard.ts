/**
 * Rate Limit Middleware Guards
 * 
 * Middleware functions to apply rate limiting to API routes.
 * 
 * Usage:
 * ```typescript
 * export const POST = withRateLimit('ai', async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  getIdentifier,
  createRateLimitHeaders,
  type RateLimitResult,
} from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/rate-limit/config'
import { getCurrentUserRole, type UserRoleInfo } from '@/lib/auth/roles'

type RouteHandler = (
  request: NextRequest,
  context?: { rateLimitResult: RateLimitResult; roleInfo: UserRoleInfo | null }
) => Promise<NextResponse> | NextResponse

/**
 * Apply rate limiting to a route handler
 * 
 * @param type - Rate limit type (auth, ai, upload, admin, api)
 * @param handler - Route handler function
 * @returns Wrapped handler with rate limiting
 * 
 * @example
 * ```typescript
 * export const POST = withRateLimit('ai', async (request) => {
 *   // Rate limit already checked
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */
export function withRateLimit(
  type: keyof typeof RATE_LIMITS,
  handler: RouteHandler
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get user role for role-based limits
      const roleInfo = await getCurrentUserRole()
      const role = roleInfo?.role

      // Get identifier (user ID or IP)
      const identifier = getIdentifier(request, roleInfo?.userId)

      // Check rate limit
      const result = await checkRateLimit(identifier, type, role)

      // Create response headers
      const headers = createRateLimitHeaders(result)

      // If rate limit exceeded, return 429
      if (!result.success) {
        // Log rate limit hit
        logRateLimitHit(identifier, type, request.url)

        return NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            message: `Rate limit exceeded. Try again in ${Math.ceil(
              result.retryAfter / 1000
            )} seconds.`,
            limit: result.limit,
            remaining: 0,
            reset: result.reset,
            retryAfter: Math.ceil(result.retryAfter / 1000),
          },
          {
            status: 429,
            headers,
          }
        )
      }

      // Execute handler
      const response = await handler(request, { rateLimitResult: result, roleInfo })

      // Add rate limit headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    } catch (error) {
      console.error('[RATE_LIMIT_GUARD] Error:', error)

      // On error, allow request but log the issue
      return await handler(request)
    }
  }
}

/**
 * Rate limit guard for authenticated routes
 * Combines authentication check with rate limiting
 * 
 * @param type - Rate limit type
 * @param handler - Route handler
 * @returns Wrapped handler
 */
export function withAuthAndRateLimit(
  type: keyof typeof RATE_LIMITS,
  handler: (
    request: NextRequest,
    context: { userId: string; role: string; rateLimitResult: RateLimitResult }
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication
      const roleInfo = await getCurrentUserRole()

      if (!roleInfo || roleInfo.status !== 'active') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get identifier
      const identifier = getIdentifier(request, roleInfo.userId)

      // Check rate limit
      const result = await checkRateLimit(identifier, type, roleInfo.role)

      // Create headers
      const headers = createRateLimitHeaders(result)

      // If rate limit exceeded
      if (!result.success) {
        logRateLimitHit(identifier, type, request.url)

        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil(
              result.retryAfter / 1000
            )} seconds.`,
            retryAfter: Math.ceil(result.retryAfter / 1000),
          },
          {
            status: 429,
            headers,
          }
        )
      }

      // Execute handler
      const response = await handler(request, {
        userId: roleInfo.userId,
        role: roleInfo.role,
        rateLimitResult: result,
      })

      // Add headers
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    } catch (error) {
      console.error('[AUTH_RATE_LIMIT_GUARD] Error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Log rate limit hit for monitoring
 */
function logRateLimitHit(identifier: string, type: string, url: string) {
  // Sanitize identifier (remove actual IPs/user IDs from logs)
  const sanitizedIdentifier = identifier.startsWith('user:')
    ? 'user:***'
    : identifier.startsWith('ip:')
    ? `ip:${identifier.slice(-4)}` // Only last 4 chars of IP
    : 'unknown'

  console.warn('[RATE_LIMIT_HIT]', {
    identifier: sanitizedIdentifier,
    type,
    endpoint: url.split('?')[0], // Remove query params
    timestamp: new Date().toISOString(),
  })
}

