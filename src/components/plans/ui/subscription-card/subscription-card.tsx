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
import { useRole } from '@/hooks/use-role'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptySubscriptionState } from './subscription-card/empty-subscription-state'
import { SubscriptionHeader } from './subscription-card/subscription-header'
import { SubscriptionDetails } from './subscription-card/subscription-details'
import { UsageLimitsSection } from './subscription-card/usage-limits-section'
import { SubscriptionActions } from './subscription-card/subscription-actions'
import { AdminUnlimitedAccess } from './subscription-card/admin-unlimited-access'

export function SubscriptionCard(): JSX.Element {
  const t = useTranslations('plans.subscription')
  
  // Check user role
  const { isAdmin, loading: roleLoading } = useRole()
  
  // Data fetching
  const { subscription, loading: subscriptionLoading } = useSubscription()
  
  // Business logic (delegated to hook)
  const { cancelling, handleCancel } = useSubscriptionCancellation()

  // Loading state
  const loading = roleLoading || subscriptionLoading
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // Admin state - show unlimited access
  if (isAdmin) {
    return (
      <AdminUnlimitedAccess
        title={t('adminTitle')}
        description={t('adminDesc')}
        unlimitedText={t('usage.unlimitedAccess')}
        tutorsLabel={t('../features.tutors')}
        documentsLabel={t('../features.documents')}
        audioFilesLabel={t('../features.audioFiles')}
        videoFilesLabel={t('../features.videoFiles')}
      />
    )
  }

  // Empty state (for normal users without subscription)
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
