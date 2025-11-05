/**
 * useBilling Hook
 * Manages billing state and usage tracking
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { getUserQuota, getUsageSummary, getUserAlerts } from '@/lib/supabase/billing'
import type { UserQuota, UsageSummary, UsageAlert } from '@/types/billing'
import { useAuth } from './use-auth'

export function useBilling() {
  const { user } = useAuth()
  const [quota, setQuota] = useState<UserQuota | null>(null)
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [alerts, setAlerts] = useState<UsageAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQuota = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getUserQuota(user.id)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setQuota(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quota')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const loadSummary = useCallback(async (days: number = 30) => {
    if (!user) return

    try {
      const result = await getUsageSummary(user.id, days)
      if (result.error) {
        console.error('Failed to load summary:', result.error)
      } else if (result.data) {
        setSummary(result.data)
      }
    } catch (err) {
      console.error('Failed to load summary:', err)
    }
  }, [user])

  const loadAlerts = useCallback(async () => {
    if (!user) return

    try {
      const result = await getUserAlerts(user.id, true)
      if (result.data) {
        setAlerts(result.data)
      }
    } catch (err) {
      console.error('Failed to load alerts:', err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadQuota()
      loadSummary()
      loadAlerts()
    }
  }, [user, loadQuota, loadSummary, loadAlerts])

  return {
    quota,
    summary,
    alerts,
    isLoading,
    error,
    reload: () => {
      loadQuota()
      loadSummary()
      loadAlerts()
    }
  }
}

