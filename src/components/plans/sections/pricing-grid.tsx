/**
 * Pricing Cards Grid Component
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { PricingCard } from '../ui/pricing-card'
import type { SubscriptionPlan, UserSubscriptionWithPlan } from '@/types/subscription'

interface PricingGridProps {
  plans: SubscriptionPlan[]
  subscription: UserSubscriptionWithPlan | null
  onSelectPlan: (planName: string, billingCycle: 'monthly' | 'yearly' | null) => Promise<void>
}

export function PricingGrid({ plans, subscription, onSelectPlan }: PricingGridProps): JSX.Element {
  const t = useTranslations('plans')
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={subscription?.plan_id === plan.id}
          isMostPopular={plan.name === 'pro'}
          onSelectPlan={onSelectPlan}
          t={t}
        />
      ))}
    </div>
  )
}

