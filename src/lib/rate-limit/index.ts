/**
 * Rate Limiting Implementation
 * 
 * Provides rate limiting functionality using Upstash Redis.
 * Uses sliding window algorithm for accurate rate limiting.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'
import { getRateLimit, parseWindow } from './config'

// Initialize Redis client
let redis: Redis | null = null
let isRedisAvailable = false

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
    isRedisAvailable = true
    console.log('✅ Redis initialized for rate limiting')
  } else {
    console.warn('⚠️  Upstash Redis not configured. Rate limiting will be disabled.')
    console.warn('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env.local')
  }
} catch (error) {
  console.error('❌ Failed to initialize Redis:', error)
  isRedisAvailable = false
}

// Cache for rate limiters (avoid recreating)
const rateLimiters = new Map<string, Ratelimit>()

/**
 * Get or create a rate limiter for a specific type and role
 */
function getRateLimiter(type: string, role?: string): Ratelimit | null {
  if (!redis || !isRedisAvailable) {
    return null
  }

  const key = `${type}:${role || 'user'}`
  
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!
  }

  const config = getRateLimit(type as any, role)
  const windowMs = parseWindow(config.window)

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${windowMs}ms`),
    analytics: true,
    prefix: `ratelimit:${type}`,
  })

  rateLimiters.set(key, limiter)
  return limiter
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}

/**
 * Check rate limit for an identifier
 * 
 * @param identifier - Unique identifier (user ID or IP address)
 * @param type - Rate limit type
 * @param role - User role (for role-based limits)
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  type: string,
  role?: string
): Promise<RateLimitResult> {
  // If Redis is not available, allow all requests
  if (!redis || !isRedisAvailable) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
      retryAfter: 0,
    }
  }

  const limiter = getRateLimiter(type, role)
  
  if (!limiter) {
    // Fallback if limiter creation fails
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
      retryAfter: 0,
    }
  }

  try {
    const result = await limiter.limit(identifier)
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? 0 : (result.reset - Date.now()),
    }
  } catch (error) {
    console.error('[RATE_LIMIT] Check failed:', error)
    // On error, allow request (fail open)
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
      retryAfter: 0,
    }
  }
}

/**
 * Get identifier for rate limiting
 * Uses user ID if available, falls back to IP address
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Get IP address from various headers (handle proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')
  
  const ip = cfConnecting || realIp || forwarded?.split(',')[0] || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Create rate limit headers for HTTP response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    ...(result.retryAfter > 0 && {
      'Retry-After': Math.ceil(result.retryAfter / 1000).toString(),
    }),
  }
}

/**
 * Reset rate limit for an identifier (for testing or admin override)
 * 
 * @param identifier - Identifier to reset
 * @param type - Rate limit type
 */
export async function resetRateLimit(
  identifier: string,
  type: string
): Promise<void> {
  if (!redis || !isRedisAvailable) {
    return
  }

  try {
    const keys = await redis.keys(`ratelimit:${type}:*:${identifier}`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('[RATE_LIMIT] Reset failed:', error)
  }
}

// Export configuration
export { RATE_LIMITS, ROLE_MULTIPLIERS, getRateLimit } from './config'
export type { RateLimitConfig } from './config'
