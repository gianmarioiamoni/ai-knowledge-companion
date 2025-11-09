/**
 * Subscription Card Component - Orchestrator
 * 
 * Responsibilities:
 * - Coordinate data fetching (subscription)
 * - Manage loading state
 * - Delegate logic to hooks
 * - Compose UI components
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { useSubscription } from '@/hooks/use-subscription'
import { useSubscriptionCancellation } from '@/hooks/use-subscription-cancellation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  EmptySubscriptionState,
  SubscriptionHeader,
  SubscriptionDetails,
  UsageLimitsSection,
  SubscriptionActions
} from '@/components/subscription'

export function SubscriptionCard(): JSX.Element {
  const t = useTranslations('plans.subscription')
  
  // Data fetching
  const { subscription, loading } = useSubscription()
  
  // Business logic (delegated to hook)
  const { cancelling, handleCancel } = useSubscriptionCancellation()

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!subscription) {
    return (
      <EmptySubscriptionState
        title={t('title')}
        upgradePlanText={t('upgradePlan')}
      />
    )
  }

  // Get status label
  const statusLabels = {
    active: t('statusActive'),
    trial: t('statusTrial'),
    cancelled: t('statusCancelled'),
    expired: t('statusExpired')
  }

  // Main content
  return (
    <Card>
      <SubscriptionHeader
        subscription={subscription}
        title={t('title')}
        statusLabel={statusLabels[subscription.status]}
        monthlyText={t('../monthly')}
        yearlyText={t('../yearly')}
        trialText={t('statusTrial')}
      />

      <CardContent className="space-y-4">
        <SubscriptionDetails
          subscription={subscription}
          expiresOnText={t('expiresOn')}
          nextPaymentText={t('nextPayment')}
          billingCycleText={t('billingCycle')}
          daysRemainingText={t('daysRemaining', { days: subscription.days_remaining })}
          monthlyText={t('../monthly')}
          yearlyText={t('../yearly')}
        />

        <UsageLimitsSection
          subscription={subscription}
          title={t('usage.title')}
          tutorsLabel={t('../features.tutors')}
          documentsLabel={t('../features.documents')}
          audioFilesLabel={t('../features.audioFiles')}
          unlimitedText={t('usage.unlimited')}
        />
      </CardContent>

      <SubscriptionActions
        status={subscription.status}
        cancelling={cancelling}
        onCancel={handleCancel}
        changePlanText={t('changePlan')}
        cancelPlanText={t('cancelPlan')}
        confirmCancelTitle={t('confirmCancel')}
        confirmCancelDesc={t('confirmCancelDesc')}
        confirmButtonText={t('confirmButton')}
        cancelText={t('../../../common.cancel')}
      />
    </Card>
  )
}
