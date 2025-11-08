/**
 * User Stats Cards Component
 * 
 * Displays summary statistics for users
 * SRP: Only responsible for rendering stats cards
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStatsCardsProps {
  stats: {
    total: number
    active: number
    disabled: number
    admins: number
  }
}

export function UserStatsCards({ stats }: UserStatsCardsProps): JSX.Element {
  const t = useTranslations('admin.users.stats')

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('total', { default: 'Total' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('active', { default: 'Active' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('disabled', { default: 'Disabled' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.disabled}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admins', { default: 'Admins' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.admins}</div>
        </CardContent>
      </Card>
    </div>
  )
}

