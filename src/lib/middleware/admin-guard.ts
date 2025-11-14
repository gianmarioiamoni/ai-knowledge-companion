/**
 * Admin Route Guards
 * 
 * Middleware functions to protect API routes with role-based access control.
 * 
 * Usage:
 *   export const GET = withAdmin(async (request, { roleInfo }) => {
 *     // Handler code - roleInfo is available
 *     return NextResponse.json({ ... })
 *   })
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getCurrentUserRole,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  type UserRoleInfo,
} from '@/lib/auth/roles'

type RouteContext = {
  roleInfo: UserRoleInfo
}

// Support both regular routes and dynamic routes with params
type RouteHandler<TParams extends Record<string, unknown> | undefined = undefined> = TParams extends undefined
  ? (request: NextRequest, context: RouteContext) => Promise<NextResponse> | NextResponse
  : (request: NextRequest, context: RouteContext, routeParams: TParams) => Promise<NextResponse> | NextResponse

/**
 * Require authentication for route
 * 
 * Ensures user is logged in and active
 */
export function withAuth<TParams extends Record<string, unknown> | undefined = undefined>(handler: RouteHandler<TParams>) {
  return async (request: NextRequest, routeParams?: TParams): Promise<NextResponse> => {
    try {
      const roleInfo = await requireAuth()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (handler as any)(request, { roleInfo }, routeParams)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication required'

      return NextResponse.json(
        {
          error: message,
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Require admin role for route
 * 
 * Ensures user is admin or super_admin
 */
export function withAdmin<TParams extends Record<string, unknown> | undefined = undefined>(handler: RouteHandler<TParams>) {
  return async (request: NextRequest, ...args: TParams extends undefined ? [] : [TParams]): Promise<NextResponse> => {
    try {
      const roleInfo = await requireAdmin()
      const segmentParams = args[0] as TParams

      return await handler(request, { roleInfo }, segmentParams as never)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin access required'

      // Check if it's an auth error or permission error
      const roleInfo = await getCurrentUserRole()
      const statusCode = !roleInfo ? 401 : 403

      return NextResponse.json(
        {
          error: message,
          code: statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
          requiredRole: 'admin',
        },
        { status: statusCode }
      )
    }
  }
}

/**
 * Require super admin role for route
 * 
 * Ensures user is super_admin
 */
export function withSuperAdmin<TParams extends Record<string, unknown> | undefined = undefined>(handler: RouteHandler<TParams>) {
  return async (request: NextRequest, ...args: TParams extends undefined ? [] : [TParams]): Promise<NextResponse> => {
    try {
      const roleInfo = await requireSuperAdmin()
      const segmentParams = args[0] as TParams

      return await handler(request, { roleInfo }, segmentParams as never)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Super admin access required'

      // Check if it's an auth error or permission error
      const roleInfo = await getCurrentUserRole()
      const statusCode = !roleInfo ? 401 : 403

      return NextResponse.json(
        {
          error: message,
          code: statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
          requiredRole: 'super_admin',
        },
        { status: statusCode }
      )
    }
  }
}

/**
 * Optional auth - provides roleInfo if available, but doesn't require it
 * 
 * Useful for routes that have different behavior based on role
 */
export function withOptionalAuth(
  handler: (
    request: NextRequest,
    context: { roleInfo: UserRoleInfo | null }
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const roleInfo = await getCurrentUserRole()

      return await handler(request, { roleInfo })
    } catch (_error) {
      // If error getting role info, continue with null
      return await handler(request, { roleInfo: null })
    }
  }
}

/**
 * Rate limiting by role
 * 
 * Apply different rate limits based on user role
 */
export function withRoleBasedRateLimit<TParams extends Record<string, unknown> | undefined = undefined>(_config: {
  user: number // requests per minute
  admin: number
  super_admin: number
}) {
  // This is a placeholder - implement with a proper rate limiting solution
  // like @upstash/ratelimit or redis
  return (handler: RouteHandler<TParams>) => {
    return withAuth(async (request: NextRequest, context: RouteContext, routeParams?: TParams) => {
      // TODO: Implement actual rate limiting with _config[context.roleInfo.role] || _config.user
      // For now, just pass through
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (handler as any)(request, context, routeParams)
    })
  }
}

/**
 * CORS helper for admin API routes
 */
export function withCors<TParams extends Record<string, unknown> | undefined = undefined>(handler: RouteHandler<TParams>, allowedOrigins?: string[]) {
  return async (request: NextRequest, routeParams?: TParams): Promise<NextResponse> => {
    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigins?.[0] || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    // Execute handler
    const roleInfo = await getCurrentUserRole()
    if (!roleInfo) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (handler as any)(request, { roleInfo }, routeParams)

    // Add CORS headers to response
    response.headers.set(
      'Access-Control-Allow-Origin',
      allowedOrigins?.[0] || '*'
    )
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )

    return response
  }
}

/**
 * Error handler wrapper
 * 
 * Catches errors and returns consistent error responses
 */
export function withErrorHandler<TParams extends Record<string, unknown> | undefined = undefined>(handler: RouteHandler<TParams>) {
  return async (request: NextRequest, context: RouteContext, routeParams?: TParams): Promise<NextResponse> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (handler as any)(request, context, routeParams)
    } catch (error) {
      console.error('API Route Error:', error)

      const message = error instanceof Error ? error.message : 'Internal server error'
      const statusCode = error instanceof Error && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500

      return NextResponse.json(
        {
          error: message,
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      )
    }
  }
}

/**
 * Compose multiple middleware functions
 * 
 * Usage:
 *   export const GET = compose(
 *     withSuperAdmin,
 *     withErrorHandler
 *   )(handler)
 */
export function compose<TParams extends Record<string, unknown> | undefined = undefined>(...middlewares: ((handler: RouteHandler<TParams>) => RouteHandler<TParams>)[]) {
  return (handler: RouteHandler<TParams>): ((request: NextRequest, routeParams?: TParams) => Promise<NextResponse>) => {
    // Apply middlewares from right to left (like function composition)
    const composedHandler = middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    )

    // Return a function that matches Next.js route handler signature
    return async (request: NextRequest, routeParams?: TParams) => {
      const roleInfo = await getCurrentUserRole()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (composedHandler as any)(request, { roleInfo: roleInfo! }, routeParams)
    }
  }
}

