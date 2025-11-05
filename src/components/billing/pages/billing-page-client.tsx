'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { AuthGuard } from '@/components/auth/auth-guard'
import { UsageDashboard } from '@/components/billing/usage-dashboard'

export function BillingPageClient(): JSX.Element {
  const t = useTranslations('billing')

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Usage Dashboard */}
        <UsageDashboard />
      </div>
    </AuthGuard>
  )
}

