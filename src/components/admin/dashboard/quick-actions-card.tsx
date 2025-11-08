/**
 * Quick Actions Card Component
 * 
 * Displays common administrative actions
 * SRP: Only responsible for rendering quick action buttons
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'

export function QuickActionsCard(): JSX.Element {
  const t = useTranslations('admin.dashboard.quickActions')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title', { default: 'Quick Actions' })}</CardTitle>
        <CardDescription>
          {t('description', { default: 'Common administrative tasks' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Link href="/admin/users">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            {t('manageUsers', { default: 'Manage Users' })}
          </Button>
        </Link>
        <Link href="/admin/billing">
          <Button variant="outline">
            <DollarSign className="mr-2 h-4 w-4" />
            {t('viewBilling', { default: 'View Billing' })}
          </Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            {t('marketplace', { default: 'Marketplace' })}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

