/**
 * Rate Limiting Module
 * 
 * Provides rate limiting functionality using Upstash Redis.
 * Uses sliding window algorithm for accurate rate limiting.
 * 
 * @see https://upstash.com/docs/redis/features/ratelimiting
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { RATE_LIMITS, getRateLimit, parseWindow, type RateLimitConfig } from './config'

/**
 * Redis client instance (singleton)
 */
let redis: Redis | null = null

/**
 * Rate limiters cache (one per config type)
 */
const limiters = new Map<string, Ratelimit>()

/**
 * Get or create Redis client
 */
function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      throw new Error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables'
      )
    }

    redis = new Redis({
      url,
      token,
    })
  }

  return redis
}

/**
 * Get or create rate limiter for a specific configuration
 */
function getRateLimiter(config: RateLimitConfig): Ratelimit {
  const key = `${config.limit}:${config.window}`

  if (!limiters.has(key)) {
    const redis = getRedisClient()

    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.limit, config.window),
        analytics: true, // Track metrics
        prefix: 'ratelimit', // Redis key prefix
      })
    )
  }

  return limiters.get(key)!
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean

  /**
   * Maximum requests allowed
   */
  limit: number

  /**
   * Requests remaining in current window
   */
  remaining: number

  /**
   * Unix timestamp (seconds) when the limit resets
   */
  reset: number

  /**
   * Milliseconds until reset
   */
  retryAfter: number
}

/**
 * Check rate limit for an identifier
 * 
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param type - Rate limit type (auth, ai, upload, admin, api)
 * @param role - User role (for role-based limits)
 * @returns Rate limit result
 * 
 * @example
 * ```typescript
 * const result = await checkRateLimit(userId, 'ai', 'admin')
 * if (!result.success) {
 *   return Response.json({ error: 'Too many requests' }, { status: 429 })
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'api',
  role?: string
): Promise<RateLimitResult> {
  try {
    // Check if rate limiting is bypassed (development only)
    if (process.env.BYPASS_RATE_LIMIT === 'true') {
      console.warn('[RATE_LIMIT] Bypassed for development')
      return {
        success: true,
        limit: 999999,
        remaining: 999999,
        reset: Date.now() + 60000,
        retryAfter: 0,
      }
    }

    const config = getRateLimit(type, role)
    const limiter = getRateLimiter(config)

    const result = await limiter.limit(identifier)

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: Math.max(0, result.reset * 1000 - Date.now()),
    }
  } catch (error) {
    // Log error but don't block request on rate limit failure
    console.error('[RATE_LIMIT] Error checking rate limit:', error)

    // Fail open - allow the request
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 0,
    }
  }
}

/**
 * Get identifier from request
 * Uses user ID if authenticated, otherwise uses IP address
 * 
 * @param request - Next.js request
 * @param userId - Optional user ID (if authenticated)
 * @returns Identifier string
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const headers = new Headers(request.headers)
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'anonymous'

  return `ip:${ip}`
}

/**
 * Create rate limit response headers
 * 
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.retryAfter > 0 && {
      'Retry-After': Math.ceil(result.retryAfter / 1000).toString(),
    }),
  }
}

/**
 * Reset rate limit for an identifier (admin function)
 * 
 * @param identifier - Identifier to reset
 * @param type - Rate limit type
 */
export async function resetRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'api'
): Promise<void> {
  try {
    const redis = getRedisClient()
    const config = RATE_LIMITS[type]
    const key = `ratelimit:${config.limit}:${config.window}:${identifier}`

    await redis.del(key)

    console.log(`[RATE_LIMIT] Reset for ${identifier} (${type})`)
  } catch (error) {
    console.error('[RATE_LIMIT] Error resetting rate limit:', error)
  }
}

