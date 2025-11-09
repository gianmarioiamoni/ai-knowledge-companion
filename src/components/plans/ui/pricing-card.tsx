/**
 * Pricing Card Component - Orchestrator
 * 
 * Responsibilities:
 * - Coordinate data preparation
 * - Delegate calculations to utilities
 * - Delegate state management to hook
 * - Compose UI components
 */

'use client'

import { JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { calculatePricing } from '@/lib/utils/pricing'
import { buildPlanFeatures } from '@/lib/utils/plan-features'
import { usePricingCardState } from '@/hooks/use-pricing-card-state'
import { PlanBadges } from './pricing-card/plan-badges'
import { PlanHeader } from './pricing-card/plan-header'
import { PriceDisplay } from './pricing-card/price-display'
import { FeaturesList } from './pricing-card/features-list'
import { PlanActionButton } from './pricing-card/plan-action-button'
import type { SubscriptionPlan } from '@/types/subscription'

interface PricingCardProps {
  plan: SubscriptionPlan
  isCurrentPlan?: boolean
  isMostPopular?: boolean
  isSelected?: boolean
  onSelectPlan: (planName: string, billingCycle: 'monthly' | 'yearly' | null) => Promise<void>
  t: any // Translation function
}

export function PricingCard({
  plan,
  isCurrentPlan = false,
  isMostPopular = false,
  isSelected = false,
  onSelectPlan,
  t
}: PricingCardProps): JSX.Element {
  // Calculate pricing info
  const pricingInfo = calculatePricing(plan, 'monthly')
  
  // State management (delegated to hook)
  const { billingCycle, setBillingCycle, loading, handleSelect } = usePricingCardState(
    plan.name,
    pricingInfo.isFree,
    onSelectPlan
  )
  
  // Recalculate pricing for current billing cycle
  const currentPricing = calculatePricing(plan, billingCycle)
  
  // Build features list
  const features = buildPlanFeatures(plan, t, currentPricing.isUnlimitedTutors)

  return (
    <Card className={cn(
      "relative flex flex-col transition-all duration-200 cursor-pointer",
      isSelected && "border-primary shadow-lg scale-105",
      isCurrentPlan && "border-green-500",
      !isSelected && !isCurrentPlan && "hover:shadow-md"
    )}>
      <PlanBadges 
        isMostPopular={isMostPopular}
        isCurrentPlan={isCurrentPlan}
        t={t}
      />

      <PlanHeader 
        displayName={plan.display_name}
        description={plan.description}
      />

      <CardContent className="flex-1 space-y-6">
        <PriceDisplay 
          pricingInfo={currentPricing}
          billingCycle={billingCycle}
          onChangeCycle={setBillingCycle}
          loading={loading}
          trialDays={plan.trial_days}
          t={t}
        />

        <FeaturesList features={features} />
      </CardContent>

      <PlanActionButton 
        isCurrentPlan={isCurrentPlan}
        isMostPopular={isMostPopular}
        loading={loading}
        onSelect={handleSelect}
        t={t}
      />
    </Card>
  )
}
