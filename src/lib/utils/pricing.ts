/**
 * Pricing Calculations Utility
 */

import type { SubscriptionPlan } from '@/types/subscription'

export interface PricingInfo {
  price: number
  pricePerMonth: string | null
  savings: number
  isFree: boolean
  isUnlimitedTutors: boolean
}

export function calculatePricing(
  plan: SubscriptionPlan,
  billingCycle: 'monthly' | 'yearly'
): PricingInfo {
  const isFree = plan.name === 'trial'
  const isUnlimitedTutors = plan.max_tutors === -1
  
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  const pricePerMonth = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(2) : null
  const savings = plan.price_monthly * 12 - plan.price_yearly
  
  return {
    price,
    pricePerMonth,
    savings,
    isFree,
    isUnlimitedTutors
  }
}

