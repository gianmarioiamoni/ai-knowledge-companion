/**
 * Billing Metrics Cards Component
 * 
 * Displays key billing metrics with growth indicators
 * SRP: Only responsible for rendering metrics cards
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react'

interface BillingMetricsCardsProps {
  totalCost: number
  totalUsers: number
  activeUsers: number
  totalTokens: number
  averageCostPerUser: number
  growth: {
    cost: number
    tokens: number
  }
}

export function BillingMetricsCards({
  totalCost,
  totalUsers,
  activeUsers,
  totalTokens,
  averageCostPerUser,
  growth,
}: BillingMetricsCardsProps): JSX.Element {
  const t = useTranslations('admin.billing.metrics')

  const renderGrowthIndicator = (value: number, label: string) => (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      {value >= 0 ? (
        <>
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-green-600">+{value.toFixed(1)}%</span>
        </>
      ) : (
        <>
          <TrendingDown className="h-3 w-3 text-red-600" />
          <span className="text-red-600">{value.toFixed(1)}%</span>
        </>
      )}
      <span className="ml-1">{label}</span>
    </p>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          {renderGrowthIndicator(
            growth.cost,
            t('vsPrevious', { default: 'vs previous' })
          )}
        </CardContent>
      </Card>

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
            {activeUsers} {t('active', { default: 'active' })}
          </p>
        </CardContent>
      </Card>

      {/* Total Tokens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalTokens', { default: 'Total Tokens' })}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(totalTokens / 1000).toFixed(1)}K</div>
          {renderGrowthIndicator(growth.tokens, '')}
        </CardContent>
      </Card>

      {/* Avg Cost Per User */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('avgCost', { default: 'Avg Cost/User' })}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${averageCostPerUser.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {t('perActiveUser', { default: 'per active user' })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

