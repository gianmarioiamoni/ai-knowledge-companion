/**
 * Pricing Card State Hook
 */

'use client'

import { useState, useCallback } from 'react'

export function usePricingCardState(
  planName: string,
  isFree: boolean,
  onSelectPlan: (planName: string, billingCycle: 'monthly' | 'yearly' | null) => Promise<void>
) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  const handleSelect = useCallback(async () => {
    setLoading(true)
    try {
      await onSelectPlan(planName, isFree ? null : billingCycle)
    } finally {
      setLoading(false)
    }
  }, [planName, isFree, billingCycle, onSelectPlan])

  return {
    billingCycle,
    setBillingCycle,
    loading,
    handleSelect
  }
}

