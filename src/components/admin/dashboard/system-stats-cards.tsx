/**
 * System Stats Cards Component
 * 
 * Displays detailed system statistics (users by role, status, billing)
 * SRP: Only responsible for rendering system stats cards
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStats {
  total: number
  active: number
  disabled: number
  users: number
  admins: number
  superAdmins: number
}

interface BillingStats {
  averageCostPerUser: number
  totalTokens: number
  totalApiCalls: number
}

interface SystemStatsCardsProps {
  userStats: UserStats
  billingStats: BillingStats | null
}

export function SystemStatsCards({
  userStats,
  billingStats,
}: SystemStatsCardsProps): JSX.Element {
  const t = useTranslations('admin.dashboard.stats')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('users', { default: 'Users by Role' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('regularUsers', { default: 'Regular Users' })}
            </span>
            <span className="font-medium">{userStats.users}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('admins', { default: 'Admins' })}
            </span>
            <span className="font-medium">{userStats.admins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('superAdmins', { default: 'Super Admins' })}
            </span>
            <span className="font-medium">{userStats.superAdmins}</span>
          </div>
        </CardContent>
      </Card>

      {/* Users by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('status', { default: 'Users by Status' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('active', { default: 'Active' })}
            </span>
            <span className="font-medium text-green-600">{userStats.active}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('disabled', { default: 'Disabled' })}
            </span>
            <span className="font-medium text-red-600">{userStats.disabled}</span>
          </div>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('billing', { default: 'Billing Summary' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('avgCostPerUser', { default: 'Avg Cost/User' })}
            </span>
            <span className="font-medium">
              ${billingStats?.averageCostPerUser.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('totalTokens', { default: 'Total Tokens' })}
            </span>
            <span className="font-medium">
              {billingStats?.totalTokens.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {t('totalCalls', { default: 'Total API Calls' })}
            </span>
            <span className="font-medium">
              {billingStats?.totalApiCalls.toLocaleString() || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

