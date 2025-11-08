/**
 * Dashboard Metrics Cards Component
 * 
 * Displays 4 key metrics for admin dashboard
 * SRP: Only responsible for rendering main dashboard metrics
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Activity, TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardMetricsCardsProps {
  totalUsers: number
  activeUsersStat: number
  totalCost: number
  activeUsersActivity: number
  growthPercent: number
}

export function DashboardMetricsCards({
  totalUsers,
  activeUsersStat,
  totalCost,
  activeUsersActivity,
  growthPercent,
}: DashboardMetricsCardsProps): JSX.Element {
  const t = useTranslations('admin.dashboard.metrics')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalUsers', { default: 'Total Users' })}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {activeUsersStat} {t('active', { default: 'active' })}
          </p>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalCost', { default: 'Total Cost' })}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {t('thisMonth', { default: 'This month' })}
          </p>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('activeUsers', { default: 'Active Users' })}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeUsersActivity}</div>
          <p className="text-xs text-muted-foreground">
            {t('withActivity', { default: 'With activity' })}
          </p>
        </CardContent>
      </Card>

      {/* Growth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('growth', { default: 'Growth' })}
          </CardTitle>
          {growthPercent >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{growthPercent.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {t('vsLastMonth', { default: 'vs last month' })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

