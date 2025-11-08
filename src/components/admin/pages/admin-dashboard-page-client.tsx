/**
 * Admin Dashboard Page Client Component (Refactored with SRP)
 * 
 * Main container for admin dashboard
 * SRP: Only responsible for coordinating child components and data fetching
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminBilling } from '@/hooks/use-admin-billing'
import { useAdminUsers } from '@/hooks/use-admin-users'
import { Shield } from 'lucide-react'
import { DashboardMetricsCards } from '@/components/admin/dashboard/dashboard-metrics-cards'
import { QuickActionsCard } from '@/components/admin/dashboard/quick-actions-card'
import { TopUsersList } from '@/components/admin/dashboard/top-users-list'
import { SystemStatsCards } from '@/components/admin/dashboard/system-stats-cards'

export function AdminDashboardPageClient(): JSX.Element {
  const t = useTranslations('admin')
  const { data: billingData, loading: billingLoading } = useAdminBilling()
  const { stats: userStats, loading: usersLoading } = useAdminUsers({
    limit: 5,
    sortBy: 'registered_at',
    sortOrder: 'desc',
  })

  const loading = billingLoading || usersLoading

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            {t('dashboard.title', { default: 'Admin Dashboard' })}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle', { default: 'System overview and management' })}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">
                {t('loading', { default: 'Loading dashboard...' })}
              </p>
            </div>
          </div>
        ) : (
          /* Data Display */
          <div className="space-y-6">
            {/* Key Metrics */}
            <DashboardMetricsCards
              totalUsers={userStats.total}
              activeUsersStat={userStats.active}
              totalCost={billingData?.totalCost || 0}
              activeUsersActivity={billingData?.activeUsers || 0}
              growthPercent={billingData?.summary.growth.cost || 0}
            />

            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Top Users by Cost */}
            {billingData && billingData.topUsersByCost.length > 0 && (
              <TopUsersList users={billingData.topUsersByCost} />
            )}

            {/* System Stats */}
            <SystemStatsCards
              userStats={userStats}
              billingStats={
                billingData
                  ? {
                      averageCostPerUser: billingData.averageCostPerUser,
                      totalTokens: billingData.totalTokens,
                      totalApiCalls: billingData.totalApiCalls,
                    }
                  : null
              }
            />
          </div>
        )}
      </div>
    </AdminGuard>
  )
}

