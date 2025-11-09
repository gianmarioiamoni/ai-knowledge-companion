/**
 * Subscription Card Data Preparation Utilities
 */

import type { UserSubscriptionWithPlan, SubscriptionStatus } from '@/types/subscription'

/**
 * Get status label translation key for a given subscription status
 */
export function getStatusLabelKey(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: 'statusActive',
    trial: 'statusTrial',
    cancelled: 'statusCancelled',
    expired: 'statusExpired'
  }
  return statusMap[status]
}

/**
 * Prepare data for SubscriptionHeader component
 */
export function prepareHeaderData(
  subscription: UserSubscriptionWithPlan,
  t: any
) {
  return {
    subscription,
    title: t('title'),
    statusLabel: t(getStatusLabelKey(subscription.status)),
    monthlyText: t('../monthly'),
    yearlyText: t('../yearly'),
    trialText: t('statusTrial')
  }
}

/**
 * Prepare data for SubscriptionDetails component
 */
export function prepareDetailsData(
  subscription: UserSubscriptionWithPlan,
  t: any
) {
  return {
    subscription,
    expiresOnText: t('expiresOn'),
    nextPaymentText: t('nextPayment'),
    billingCycleText: t('billingCycle'),
    daysRemainingText: t('daysRemaining', { days: subscription.days_remaining }),
    monthlyText: t('../monthly'),
    yearlyText: t('../yearly')
  }
}

/**
 * Prepare data for UsageLimitsSection component
 */
export function prepareUsageLimitsData(
  subscription: UserSubscriptionWithPlan,
  t: any
) {
  return {
    subscription,
    title: t('usage.title'),
    tutorsLabel: t('../features.tutors'),
    documentsLabel: t('../features.documents'),
    audioFilesLabel: t('../features.audioFiles'),
    unlimitedText: t('usage.unlimited')
  }
}

/**
 * Prepare data for SubscriptionActions component
 */
export function prepareActionsData(
  subscription: UserSubscriptionWithPlan,
  cancelling: boolean,
  handleCancel: () => void,
  t: any
) {
  return {
    status: subscription.status,
    cancelling,
    onCancel: handleCancel,
    changePlanText: t('changePlan'),
    cancelPlanText: t('cancelPlan'),
    confirmCancelTitle: t('confirmCancel'),
    confirmCancelDesc: t('confirmCancelDesc'),
    confirmButtonText: t('confirmButton'),
    cancelText: t('../../../common.cancel')
  }
}

/**
 * Prepare data for AdminUnlimitedAccess component
 */
export function prepareAdminData(t: any) {
  return {
    title: t('adminTitle'),
    description: t('adminDesc'),
    unlimitedText: t('usage.unlimitedAccess'),
    tutorsLabel: t('../features.tutors'),
    documentsLabel: t('../features.documents'),
    audioFilesLabel: t('../features.audioFiles'),
    videoFilesLabel: t('../features.videoFiles')
  }
}

/**
 * Prepare data for EmptySubscriptionState component
 */
export function prepareEmptyStateData(t: any) {
  return {
    title: t('title'),
    upgradePlanText: t('upgradePlan')
  }
}

