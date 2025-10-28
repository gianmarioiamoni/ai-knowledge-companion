import { useAuth } from '@/hooks/use-auth'
import { useTranslations } from 'next-intl'

export interface DashboardStats {
  totalDocuments: number
  totalTutors: number
  totalConversations: number
  apiCalls: number
}

export interface DashboardData {
  stats: DashboardStats
  isLoading: boolean
  user: any
}

export function useDashboard(): DashboardData {
  const { user } = useAuth()
  const t = useTranslations('dashboard')

  // Mock data - in a real app, this would come from API calls
  const stats: DashboardStats = {
    totalDocuments: 0,
    totalTutors: 0,
    totalConversations: 0,
    apiCalls: 0,
  }

  const isLoading = !user

  return {
    stats,
    isLoading,
    user,
  }
}
