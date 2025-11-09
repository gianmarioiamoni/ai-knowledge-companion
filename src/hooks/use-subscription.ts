/**
 * Subscription Hook - Manage user subscription
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { SubscriptionPlan, UserSubscriptionWithPlan, BillingCycle, PlanName } from '@/types/subscription'

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscriptionWithPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/subscriptions/current')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch subscription')
      }
      
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (err) {
      console.error('Fetch subscription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const upgradePlan = useCallback(async (planName: PlanName, billingCycle?: BillingCycle) => {
    try {
      setError(null)
      
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planName, billingCycle }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade plan')
      }
      
      // Refresh subscription
      await fetchSubscription()
      
      return { success: true, message: data.message }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade plan'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchSubscription])

  const cancelSubscription = useCallback(async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
      
      // Refresh subscription
      await fetchSubscription()
      
      return { success: true, message: data.message }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchSubscription])

  const goToPlans = useCallback(() => {
    router.push('/plans')
  }, [router])

  return {
    subscription,
    loading,
    error,
    upgradePlan,
    cancelSubscription,
    goToPlans,
    refreshSubscription: fetchSubscription
  }
}

