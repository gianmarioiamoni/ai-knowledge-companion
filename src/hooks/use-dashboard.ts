import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTranslations } from 'next-intl'
import { getDashboardStats, type DashboardStats } from '@/lib/supabase/dashboard'

// Re-export type for external use
export type { DashboardStats }

export interface DashboardData {
  stats: DashboardStats
  isLoading: boolean
  user: any
  error?: string
}

/**
 * Dashboard hook with SSR support
 * 
 * @param initialStats - Optional initial stats from SSR
 * @returns Dashboard data and loading state
 */
export function useDashboard(initialStats?: DashboardStats): DashboardData {
  const { user } = useAuth()
  const t = useTranslations('dashboard')
  
  console.log('[useDashboard] Hook called with initialStats:', initialStats)
  console.log('[useDashboard] User from useAuth:', user?.id)
  
  const [stats, setStats] = useState<DashboardStats>(
    initialStats || {
      totalDocuments: 0,
      totalTutors: 0,
      totalConversations: 0,
      totalMessages: 0,
      apiCalls: 0,
    }
  )
  const [isLoading, setIsLoading] = useState(!initialStats) // No loading if we have initial data
  const [error, setError] = useState<string>()
  
  console.log('[useDashboard] Current stats state:', stats)

  useEffect(() => {
    async function fetchStats() {
      console.log('[useDashboard] fetchStats useEffect triggered', { user: user?.id, hasInitialStats: !!initialStats })
      
      if (!user) {
        console.log('[useDashboard] No user, skipping fetch')
        setIsLoading(false)
        return
      }

      // Skip fetching if we already have initial stats
      if (initialStats) {
        console.log('[useDashboard] Has initialStats, skipping fetch')
        setIsLoading(false)
        return
      }

      try {
        console.log('[useDashboard] Fetching stats from client...')
        setIsLoading(true)
        setError(undefined)
        
        const result = await getDashboardStats()
        
        if (result.error) {
          console.log('[useDashboard] Fetch error:', result.error)
          setError(result.error)
        } else if (result.data) {
          console.log('[useDashboard] Fetch success, setting stats:', result.data)
          setStats(result.data)
        }
      } catch (err) {
        console.error('[useDashboard] Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, initialStats])

  // Reset stats when user changes
  useEffect(() => {
    console.log('[useDashboard] User change effect triggered', { user: user?.id })
    if (!user) {
      console.log('[useDashboard] ⚠️ RESETTING STATS TO ZERO because no user!')
      setStats({
        totalDocuments: 0,
        totalTutors: 0,
        totalConversations: 0,
        totalMessages: 0,
        apiCalls: 0,
      })
    }
  }, [user])

  return {
    stats,
    isLoading,
    user,
    error,
  }
}
