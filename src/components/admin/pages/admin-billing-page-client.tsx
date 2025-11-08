/**
 * Admin Billing Page Client Component (Refactored with SRP)
 * 
 * Main container for billing dashboard
 * SRP: Only responsible for coordinating child components and period selection
 */

'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminBilling } from '@/hooks/use-admin-billing'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign } from 'lucide-react'
import { BillingMetricsCards } from '@/components/admin/billing/billing-metrics-cards'
import { TopUsersTable } from '@/components/admin/billing/top-users-table'
import { BillingSummaryCards } from '@/components/admin/billing/billing-summary-cards'

export function AdminBillingPageClient(): JSX.Element {
  const t = useTranslations('admin.billing')
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')

  const { data, loading, error } = useAdminBilling({ period, limit: 20 })

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              {t('title', { default: 'Billing Dashboard' })}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle', { default: 'Aggregated billing and usage statistics' })}
            </p>
          </div>

          {/* Period Selector */}
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">
                {t('period.day', { default: 'Last 24 Hours' })}
              </SelectItem>
              <SelectItem value="week">
                {t('period.week', { default: 'Last 7 Days' })}
              </SelectItem>
              <SelectItem value="month">
                {t('period.month', { default: 'This Month' })}
              </SelectItem>
              <SelectItem value="year">
                {t('period.year', { default: 'This Year' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">
                {t('loading', { default: 'Loading billing data...' })}
              </p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : !data ? (
          /* No Data State */
          <div className="text-center py-8 text-muted-foreground">
            {t('noData', { default: 'No data available' })}
          </div>
        ) : (
          /* Data Display */
          <div className="space-y-6">
            {/* Key Metrics */}
            <BillingMetricsCards
              totalCost={data.totalCost}
              totalUsers={data.totalUsers}
              activeUsers={data.activeUsers}
              totalTokens={data.totalTokens}
              averageCostPerUser={data.averageCostPerUser}
              growth={{
                cost: data.summary.growth.cost,
                tokens: data.summary.growth.tokens,
              }}
            />

            {/* Top Users by Cost */}
            <TopUsersTable users={data.topUsersByCost} />

            {/* Summary Comparison */}
            <BillingSummaryCards
              currentPeriod={data.summary.currentMonth}
              previousPeriod={data.summary.previousMonth}
            />
          </div>
        )}
      </div>
    </AdminGuard>
  )
}

