/**
 * Pricing Cards Grid Component
 */

'use client'

import { JSX, useState } from 'react'
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
  
  // Track which plan is currently selected/focused
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    // Default to 'pro' plan or first plan
    plans.find(p => p.name === 'pro')?.id || plans[0]?.id || null
  )

  const handleCardClick = (planId: string) => {
    setSelectedPlanId(planId)
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {plans.map((plan) => (
        <div key={plan.id} onClick={() => handleCardClick(plan.id)}>
          <PricingCard
            plan={plan}
            isCurrentPlan={subscription?.plan_id === plan.id}
            isMostPopular={plan.name === 'pro'}
            isSelected={selectedPlanId === plan.id}
            onSelectPlan={onSelectPlan}
            t={t}
          />
        </div>
      ))}
    </div>
  )
}

