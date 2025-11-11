/**
 * Server-Side Authentication Helper
 * 
 * Provides SSR-compatible user authentication check
 * Uses Supabase SSR client to verify user session
 * 
 * @example
 * ```typescript
 * const { user, error } = await getUserServer()
 * if (!user) redirect('/auth/login')
 * ```
 */

import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface GetUserServerResult {
  user: User | null
  error: Error | null
}

/**
 * Get authenticated user server-side
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getUserServer(): Promise<GetUserServerResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('[Auth SSR] Error getting user:', error.message)
      return { user: null, error }
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('[Auth SSR] Unexpected error:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error : new Error('Unknown auth error')
    }
  }
}

/**
 * Check if user is authenticated (simplified helper)
 * 
 * @returns true if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getUserServer()
  return user !== null
}

/**
 * Get user or throw error (for protected routes)
 * 
 * @returns User object
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const { user, error } = await getUserServer()
  
  if (!user) {
    throw new Error(error?.message || 'Authentication required')
  }
  
  return user
}

