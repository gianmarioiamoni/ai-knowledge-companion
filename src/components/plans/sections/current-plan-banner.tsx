/**
 * Current Plan Banner Component
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import type { UserSubscriptionWithPlan } from '@/types/subscription'

interface CurrentPlanBannerProps {
  subscription: UserSubscriptionWithPlan | null
}

export function CurrentPlanBanner({ subscription }: CurrentPlanBannerProps): JSX.Element | null {
  const t = useTranslations('plans')
  
  // Don't show banner if no subscription or if expired
  if (!subscription || subscription.status === 'expired') {
    return null
  }
  
  return (
    <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            {t('currentPlanInfo.title')}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {t('currentPlanInfo.description', {
              plan: subscription.plan_display_name,
              days: subscription.days_remaining
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

