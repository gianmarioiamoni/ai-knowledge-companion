/**
 * Dashboard Server-Side Data Fetching
 * 
 * SSR-compatible functions to fetch dashboard statistics
 * Uses Supabase SSR client for server-side rendering
 */

import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface DashboardStats {
  totalDocuments: number
  totalTutors: number
  totalConversations: number
  totalMessages: number
  apiCalls: number
}

/**
 * Get dashboard statistics server-side
 * 
 * @param userId - User ID to fetch stats for
 * @returns Dashboard statistics
 */
export async function getDashboardStatsServer(
  userId: string
): Promise<{ data?: DashboardStats; error?: string }> {
  try {
    const supabase = await createClient()

    // Fetch all statistics in parallel
    const [
      documentsResult,
      tutorsResult,
      conversationsResult,
      messagesResult,
      apiCallsResult
    ] = await Promise.all([
      // Count documents
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId),
      
      // Count tutors
      supabase
        .from('tutors')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId),
      
      // Count conversations
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      // Count total messages (via conversations)
      supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .then(async ({ data: conversations, error }) => {
          if (error || !conversations) return { count: null, error }
          
          const conversationIds = conversations.map(c => c.id)
          if (conversationIds.length === 0) return { count: 0, error: null }
          
          return supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
        }),
      
      // TODO: Count API calls when billing_tracking table is created
      // For now, return a resolved promise with 0
      Promise.resolve({ data: null, error: null })
    ])

    // Check for errors
    if (documentsResult.error) {
      console.error('[Dashboard SSR] Error counting documents:', documentsResult.error)
    }
    if (tutorsResult.error) {
      console.error('[Dashboard SSR] Error counting tutors:', tutorsResult.error)
    }
    if (conversationsResult.error) {
      console.error('[Dashboard SSR] Error counting conversations:', conversationsResult.error)
    }
    if (messagesResult.error) {
      console.error('[Dashboard SSR] Error counting messages:', messagesResult.error)
    }

    // Aggregate stats
    const stats: DashboardStats = {
      totalDocuments: documentsResult.count || 0,
      totalTutors: tutorsResult.count || 0,
      totalConversations: conversationsResult.count || 0,
      totalMessages: messagesResult.count || 0,
      apiCalls: 0,  // TODO: Implement when billing_tracking table exists
    }

    return { data: stats }
  } catch (error) {
    console.error('[Dashboard SSR] Unexpected error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to load dashboard statistics'
    }
  }
}

