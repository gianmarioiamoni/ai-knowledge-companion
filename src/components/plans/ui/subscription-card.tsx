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
  const tSub = useTranslations('plans.subscription')
  const tPlans = useTranslations('plans')
  const tCommon = useTranslations('common')
  const state = useSubscriptionCardState()

  // Prepare translation object with all needed keys
  const translations = {
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

  return (
    <Card>
      <SubscriptionHeader {...prepareHeaderData(subscription, translations, tSub)} />

      <CardContent className="space-y-4">
        <SubscriptionDetails {...prepareDetailsData(subscription, translations, tSub)} />
        <UsageLimitsSection {...prepareUsageLimitsData(subscription, translations)} />
      </CardContent>

      <SubscriptionActions 
        {...prepareActionsData(subscription, cancelling, handleCancel, translations)} 
      />
    </Card>
  )
}
