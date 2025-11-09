/**
 * Subscription Details Component
 */

import { JSX } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import type { UserSubscriptionWithPlan } from '@/types/subscription'

interface SubscriptionDetailsProps {
  subscription: UserSubscriptionWithPlan
  expiresOnText: string
  nextPaymentText: string
  billingCycleText: string
  daysRemainingText: string
  monthlyText: string
  yearlyText: string
}

export function SubscriptionDetails({ 
  subscription,
  expiresOnText,
  nextPaymentText,
  billingCycleText,
  daysRemainingText,
  monthlyText,
  yearlyText
}: SubscriptionDetailsProps): JSX.Element {
  const isTrial = subscription.status === 'trial'
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Date Information */}
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {isTrial ? expiresOnText : nextPaymentText}
        </div>
        <div className="font-medium">
          {new Date(subscription.end_date).toLocaleDateString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {daysRemainingText}
        </div>
      </div>

      {/* Billing Cycle (only for paid plans) */}
      {!isTrial && subscription.billing_cycle && (
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {billingCycleText}
          </div>
          <div className="font-medium capitalize">
            {subscription.billing_cycle === 'monthly' ? monthlyText : yearlyText}
          </div>
        </div>
      )}
    </div>
  )
}

