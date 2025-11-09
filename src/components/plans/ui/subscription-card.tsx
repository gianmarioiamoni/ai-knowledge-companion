/**
 * Subscription Card Component - Pure Orchestrator
 * 
 * Responsibilities:
 * - Get state from hook
 * - Get translations
 * - Delegate data preparation to utilities
 * - Compose UI components based on state
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSubscriptionCardState } from '@/hooks/use-subscription-card-state'
import {
  prepareAdminData,
  prepareEmptyStateData,
  prepareHeaderData,
  prepareDetailsData,
  prepareUsageLimitsData,
  prepareActionsData
} from '@/lib/utils/subscription-card-data'
import { EmptySubscriptionState } from './subscription-card/empty-subscription-state'
import { SubscriptionHeader } from './subscription-card/subscription-header'
import { SubscriptionDetails } from './subscription-card/subscription-details'
import { UsageLimitsSection } from './subscription-card/usage-limits-section'
import { SubscriptionActions } from './subscription-card/subscription-actions'
import { AdminUnlimitedAccess } from './subscription-card/admin-unlimited-access'

export function SubscriptionCard(): JSX.Element {
  const t = useTranslations('plans.subscription')
  const state = useSubscriptionCardState()

  // Loading state
  if (state.type === 'loading') {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // Admin state
  if (state.type === 'admin') {
    return <AdminUnlimitedAccess {...prepareAdminData(t)} />
  }

  // Empty state
  if (state.type === 'empty') {
    return <EmptySubscriptionState {...prepareEmptyStateData(t)} />
  }

  // Active subscription state
  const { subscription, cancelling, handleCancel } = state

  return (
    <Card>
      <SubscriptionHeader {...prepareHeaderData(subscription, t)} />

      <CardContent className="space-y-4">
        <SubscriptionDetails {...prepareDetailsData(subscription, t)} />
        <UsageLimitsSection {...prepareUsageLimitsData(subscription, t)} />
      </CardContent>

      <SubscriptionActions 
        {...prepareActionsData(subscription, cancelling, handleCancel, t)} 
      />
    </Card>
  )
}
