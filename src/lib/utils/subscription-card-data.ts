/**
 * Subscription Card Data Preparation Utilities
 */

import type { UserSubscriptionWithPlan, SubscriptionStatus } from '@/types/subscription'

interface Translations {
  title: string
  statusActive: string
  statusTrial: string
  statusCancelled: string
  statusExpired: string
  expiresOn: string
  nextPayment: string
  billingCycle: string
  changePlan: string
  cancelPlan: string
  upgradePlan: string
  confirmCancel: string
  confirmCancelDesc: string
  confirmButton: string
  adminTitle: string
  adminDesc: string
  usageTitle: string
  usageUnlimited: string
  usageUnlimitedAccess: string
  monthly: string
  yearly: string
  featuresTutors: string
  featuresDocuments: string
  featuresAudioFiles: string
  featuresImageFiles: string
  featuresVideoFiles: string
  cancel: string
}

/**
 * Get status label for a given subscription status
 */
export function getStatusLabel(status: SubscriptionStatus, translations: Translations): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: translations.statusActive,
    trial: translations.statusTrial,
    cancelled: translations.statusCancelled,
    expired: translations.statusExpired
  }
  return statusMap[status]
}

/**
 * Prepare data for SubscriptionHeader component
 */
export function prepareHeaderData(
  subscription: UserSubscriptionWithPlan,
  translations: Translations,
  tSub: any
) {
  return {
    subscription,
    title: translations.title,
    statusLabel: getStatusLabel(subscription.status, translations),
    monthlyText: translations.monthly,
    yearlyText: translations.yearly,
    trialText: translations.statusTrial
  }
}

/**
 * Prepare data for SubscriptionDetails component
 */
export function prepareDetailsData(
  subscription: UserSubscriptionWithPlan,
  translations: Translations,
  tSub: any
) {
  return {
    subscription,
    expiresOnText: translations.expiresOn,
    nextPaymentText: translations.nextPayment,
    billingCycleText: translations.billingCycle,
    daysRemainingText: tSub('daysRemaining', { days: subscription.days_remaining }),
    monthlyText: translations.monthly,
    yearlyText: translations.yearly
  }
}

/**
 * Prepare data for UsageLimitsSection component
 */
export function prepareUsageLimitsData(
  subscription: UserSubscriptionWithPlan,
  translations: Translations
) {
  return {
    subscription,
    title: translations.usageTitle,
    tutorsLabel: translations.featuresTutors,
    documentsLabel: translations.featuresDocuments,
    audioFilesLabel: translations.featuresAudioFiles,
    imageFilesLabel: translations.featuresImageFiles,
    unlimitedText: translations.usageUnlimited
  }
}

/**
 * Prepare data for SubscriptionActions component
 */
export function prepareActionsData(
  subscription: UserSubscriptionWithPlan,
  hasStripeSubscription: boolean,
  translations: Translations
) {
  return {
    status: subscription.status,
    hasStripeSubscription,
    changePlanText: translations.changePlan,
    manageSubscriptionText: translations.manageSubscription || 'Manage Subscription',
  }
}

/**
 * Prepare data for AdminUnlimitedAccess component
 */
export function prepareAdminData(translations: Translations) {
  return {
    title: translations.adminTitle,
    description: translations.adminDesc,
    unlimitedText: translations.usageUnlimitedAccess,
    tutorsLabel: translations.featuresTutors,
    documentsLabel: translations.featuresDocuments,
    audioFilesLabel: translations.featuresAudioFiles,
    videoFilesLabel: translations.featuresVideoFiles
  }
}

/**
 * Prepare data for EmptySubscriptionState component
 */
export function prepareEmptyStateData(translations: Translations) {
  return {
    title: translations.title,
    upgradePlanText: translations.upgradePlan
  }
}

