/**
 * useAdminUsageData Hook
 * Manages admin usage data fetching, sorting, and filtering
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

export interface UserUsage {
  user_id: string
  email: string
  role: string
  status: string
  current: {
    api_calls: number
    tokens: number
    cost: number
  }
  max: {
    api_calls: number
    tokens: number
    cost: number
  }
  percentages: {
    api_calls: number
    tokens: number
    cost: number
  }
  last_30_days: {
    api_calls: number
    tokens: number
    cost: number
  }
  billing_period_start: string
  next_reset_at: string
}

export interface UsageTotals {
  current: {
    api_calls: number
    tokens: number
    cost: number
  }
  max: {
    api_calls: number
    tokens: number
    cost: number
  }
  last_30_days: {
    api_calls: number
    tokens: number
    cost: number
  }
  users_count: number
  active_users: number
}

export interface UsageData {
  users: UserUsage[]
  totals: UsageTotals
}

export type SortField = 'cost' | 'tokens' | 'api_calls'
export type SortOrder = 'asc' | 'desc'

export function useAdminUsageData() {
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortField>('cost')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const fetchUsageData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/usage/all')
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch usage data')
      }

      setData(result)
    } catch (err) {
      console.error('Error fetching usage data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsageData()
  }, [fetchUsageData])

  const handleSort = useCallback((field: SortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((order) => (order === 'desc' ? 'asc' : 'desc'))
        return field
      }
      setSortOrder('desc')
      return field
    })
  }, [])

  const sortedUsers = useMemo(() => {
    if (!data) return []

    return [...data.users].sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortBy) {
        case 'cost':
          aValue = a.current.cost
          bValue = b.current.cost
          break
        case 'tokens':
          aValue = a.current.tokens
          bValue = b.current.tokens
          break
        case 'api_calls':
          aValue = a.current.api_calls
          bValue = b.current.api_calls
          break
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [data, sortBy, sortOrder])

  return {
    data,
    sortedUsers,
    isLoading,
    error,
    sortBy,
    sortOrder,
    handleSort,
    reload: fetchUsageData,
  }
}

