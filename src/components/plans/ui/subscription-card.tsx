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
import { ScheduledPlanBanner } from './subscription-card/scheduled-plan-banner'

export function SubscriptionCard(): JSX.Element {
  const tSub = useTranslations('plans.subscription')
  const tPlans = useTranslations('plans')
  const tCommon = useTranslations('common')
  const tScheduled = useTranslations('plans.scheduledChange')
  const state = useSubscriptionCardState()

  // Prepare translation object with all needed keys
  const translations = {
    // Scheduled change keys
    scheduledChangeTitle: tScheduled('title'),
    scheduledChangeDescription: tScheduled('description'),
    effectiveDate: tScheduled('effectiveDate'),
    // Subscription keys
    title: tSub('title'),
    statusActive: tSub('statusActive'),
    statusTrial: tSub('statusTrial'),
    statusCancelled: tSub('statusCancelled'),
    statusExpired: tSub('statusExpired'),
    expiresOn: tSub('expiresOn'),
    nextPayment: tSub('nextPayment'),
    billingCycle: tSub('billingCycle'),
    changePlan: tSub('changePlan'),
    cancelPlan: tSub('cancelPlan'),
    upgradePlan: tSub('upgradePlan'),
    confirmCancel: tSub('confirmCancel'),
    confirmCancelDesc: tSub('confirmCancelDesc'),
    confirmButton: tSub('confirmButton'),
    adminTitle: tSub('adminTitle'),
    adminDesc: tSub('adminDesc'),
    usageTitle: tSub('usage.title'),
    usageUnlimited: tSub('usage.unlimited'),
    usageUnlimitedAccess: tSub('usage.unlimitedAccess'),
    // Plans keys
    monthly: tPlans('monthly'),
    yearly: tPlans('yearly'),
    featuresTutors: tPlans('features.tutors'),
    featuresDocuments: tPlans('features.documents'),
    featuresAudioFiles: tPlans('features.audioFiles'),
    featuresImageFiles: tPlans('features.imageFiles'),
    featuresVideoFiles: tPlans('features.videoFiles'),
    // Common keys
    cancel: tCommon('cancel')
  }

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
    return <AdminUnlimitedAccess {...prepareAdminData(translations)} />
  }

  // Empty state
  if (state.type === 'empty') {
    return <EmptySubscriptionState {...prepareEmptyStateData(translations)} />
  }

  // Active subscription state
  const { subscription, cancelling, handleCancel } = state
  
  // Check if user has a Stripe subscription (has stripe_subscription_id)
  const hasStripeSubscription = !!subscription.stripe_subscription_id
  
  // Check if there's a scheduled plan change
  const hasScheduledChange = !!subscription.scheduled_plan_id

  return (
    <Card>
      <SubscriptionHeader {...prepareHeaderData(subscription, translations, tSub)} />

      <CardContent className="space-y-4">
        {/* Show scheduled plan change banner if applicable */}
        {hasScheduledChange && subscription.scheduled_plan_display_name && subscription.scheduled_change_date && (
          <ScheduledPlanBanner
            scheduledPlanName={subscription.scheduled_plan_display_name}
            scheduledBillingCycle={subscription.scheduled_billing_cycle || 'monthly'}
            scheduledChangeDate={subscription.scheduled_change_date}
            currentPlanName={subscription.plan_display_name}
            currentBillingCycle={subscription.billing_cycle}
            titleText={translations.scheduledChangeTitle || 'Scheduled Plan Change'}
            descriptionText={translations.scheduledChangeDescription || 'Your plan will change from {current} to {scheduled}'}
            effectiveDateText={translations.effectiveDate || 'Effective Date'}
          />
        )}
        
        <SubscriptionDetails {...prepareDetailsData(subscription, translations, tSub)} />
        <UsageLimitsSection {...prepareUsageLimitsData(subscription, translations)} />
      </CardContent>

      <SubscriptionActions 
        {...prepareActionsData(subscription, hasStripeSubscription, translations)} 
      />
    </Card>
  )
}
