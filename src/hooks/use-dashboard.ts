import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTranslations } from 'next-intl'
import { getDashboardStats, type DashboardStats } from '@/lib/supabase/dashboard'

export interface DashboardData {
  stats: DashboardStats
  isLoading: boolean
  user: any
  error?: string
}

export function useDashboard(): DashboardData {
  const { user } = useAuth()
  const t = useTranslations('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalTutors: 0,
    totalConversations: 0,
    totalMessages: 0,
    apiCalls: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
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
  }, [user])

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
