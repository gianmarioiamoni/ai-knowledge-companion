/**
 * Subscription Header Component
 */

import { JSX } from 'react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'
import { getStatusColor } from '@/lib/utils/subscription-status'
import type { UserSubscriptionWithPlan } from '@/types/subscription'

interface SubscriptionHeaderProps {
  subscription: UserSubscriptionWithPlan
  title: string
  statusLabel: string
  monthlyText: string
  yearlyText: string
  trialText: string
}

export function SubscriptionHeader({ 
  subscription, 
  title, 
  statusLabel,
  monthlyText,
  yearlyText,
  trialText
}: SubscriptionHeaderProps): JSX.Element {
  const billingText = subscription.billing_cycle 
    ? (subscription.billing_cycle === 'monthly' ? monthlyText : yearlyText)
    : trialText

  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription className="mt-2">
            {subscription.plan_display_name} - {billingText}
          </CardDescription>
        </div>
        <Badge className={getStatusColor(subscription.status)}>
          {statusLabel}
        </Badge>
      </div>
    </CardHeader>
  )
}

