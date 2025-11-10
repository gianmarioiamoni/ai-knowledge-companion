/**
 * Supabase Service Client
 * Creates a Supabase client with service role key for backend operations
 * This bypasses Row Level Security (RLS) - use with caution!
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Create a Supabase client with service role key
 * Use this for backend operations that need to bypass RLS
 * 
 * SECURITY WARNING:
 * - Never expose this client to the frontend
 * - Only use in API routes, server components, and server-side code
 * - Service role key has full database access
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

