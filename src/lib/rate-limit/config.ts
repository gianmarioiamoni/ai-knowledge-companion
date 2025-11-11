/**
 * Rate Limiting Configuration
 * 
 * Defines rate limits for different types of API endpoints.
 * Uses sliding window algorithm via Upstash Redis.
 */

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number
  
  /**
   * Time window for the limit
   * Format: number + unit (s=seconds, m=minutes, h=hours, d=days)
   * Examples: '60s', '10m', '1h', '1d'
   */
  window: string
}

/**
 * Rate limit configurations by endpoint type
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  /**
   * Authentication endpoints - Prevent brute force attacks
   * Used for: /api/auth/login, /api/auth/signup
   */
  auth: {
    limit: 5,
    window: '1m', // 5 attempts per minute
  },

  /**
   * AI/OpenAI endpoints - Prevent cost abuse
   * Used for: /api/chat/send, /api/documents/process
   */
  ai: {
    limit: 10,
    window: '1m', // 10 requests per minute
  },

  /**
   * File upload endpoints - Prevent spam
   * Used for: /api/documents/create, /api/multimedia/upload
   */
  upload: {
    limit: 5,
    window: '5m', // 5 uploads per 5 minutes
  },

  /**
   * Admin operations - Moderate rate for admin actions
   * Used for: /api/admin/*
   */
  admin: {
    limit: 30,
    window: '1m', // 30 requests per minute
  },

  /**
   * General API - Standard protection
   * Used for: All other endpoints
   */
  api: {
    limit: 60,
    window: '1m', // 60 requests per minute
  },
}

/**
 * Role-based rate limit multipliers
 * Higher roles get higher limits
 */
export const ROLE_MULTIPLIERS: Record<string, number> = {
  user: 1.0,        // Normal limits
  admin: 3.0,       // 3x limits
  super_admin: 10.0, // 10x limits
}

/**
 * Get rate limit for a specific endpoint type and role
 */
export function getRateLimit(
  type: keyof typeof RATE_LIMITS,
  role?: string
): RateLimitConfig {
  const baseLimit = RATE_LIMITS[type]
  
  if (!role || role === 'user') {
    return baseLimit
  }

  const multiplier = ROLE_MULTIPLIERS[role] || 1.0

  return {
    ...baseLimit,
    limit: Math.floor(baseLimit.limit * multiplier),
  }
}

/**
 * Parse window string to milliseconds
 * @param window - Format: '60s', '10m', '1h', '1d'
 * @returns milliseconds
 */
export function parseWindow(window: string): number {
  const unit = window.slice(-1)
  const value = parseInt(window.slice(0, -1))

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return value * (multipliers[unit] || 1000)
}

