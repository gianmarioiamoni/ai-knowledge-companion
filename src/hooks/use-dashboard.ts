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

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setIsLoading(false)
        return
      }

      // Skip fetching if we already have initial stats
      if (initialStats) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(undefined)
        
        const result = await getDashboardStats()
        
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setStats(result.data)
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, initialStats])

  // Reset stats when user changes
  useEffect(() => {
    if (!user) {
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
