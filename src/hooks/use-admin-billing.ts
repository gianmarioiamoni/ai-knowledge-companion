/**
 * useAdminBilling Hook
 * 
 * Fetches aggregated billing data for admin dashboard
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface TopUser {
  userId: string
  email: string
  displayName: string | null
  cost: number
  tokens: number
  apiCalls: number
}

interface CostByDay {
  date: string
  cost: number
  tokens: number
  apiCalls: number
}

interface Summary {
  currentMonth: {
    cost: number
    tokens: number
    apiCalls: number
  }
  previousMonth: {
    cost: number
    tokens: number
    apiCalls: number
  }
  growth: {
    cost: number
    tokens: number
    apiCalls: number
  }
}

interface BillingData {
  totalUsers: number
  activeUsers: number
  totalCost: number
  totalTokens: number
  totalApiCalls: number
  averageCostPerUser: number
  topUsersByCost: TopUser[]
  costByDay: CostByDay[]
  summary: Summary
}

interface UseAdminBillingParams {
  period?: 'day' | 'week' | 'month' | 'year'
  limit?: number
  autoFetch?: boolean
}

interface UseAdminBillingReturn {
  data: BillingData | null
  loading: boolean
  error: string | null
  fetchBilling: () => Promise<void>
  refresh: () => Promise<void>
}

export function useAdminBilling(params: UseAdminBillingParams = {}): UseAdminBillingReturn {
  const { period = 'month', limit = 10, autoFetch = true } = params

  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBilling = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        period,
        limit: limit.toString(),
      })

      const response = await fetch(`/api/admin/billing?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch billing data')
      }

      const billingData = await response.json()
      setData(billingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [period, limit])

  useEffect(() => {
    if (autoFetch) {
      fetchBilling()
    }
  }, [autoFetch, fetchBilling])

  return {
    data,
    loading,
    error,
    fetchBilling,
    refresh: fetchBilling,
  }
}

