/**
 * Plans Hook - Manage subscription plans
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SubscriptionPlan } from '@/types/subscription'

export function usePlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/subscriptions/plans')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch plans')
      }
      
      const data = await response.json()
      setPlans(data.plans)
    } catch (err) {
      console.error('Fetch plans error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const getPlanByName = useCallback((name: string): SubscriptionPlan | undefined => {
    return plans.find(p => p.name === name)
  }, [plans])

  return {
    plans,
    loading,
    error,
    getPlanByName,
    refreshPlans: fetchPlans
  }
}

