/**
 * Usage Limits Hook - Check and enforce subscription limits
 */

'use client'

import { useState, useCallback } from 'react'
import type { UsageLimit } from '@/types/subscription'

type ResourceType = 'tutors' | 'documents' | 'audio' | 'video'

export function useUsageLimits() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkLimit = useCallback(async (resourceType: ResourceType): Promise<UsageLimit | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/subscriptions/check-limit?type=${resourceType}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to check limit')
      }
      
      const data = await response.json()
      return data.limit
    } catch (err) {
      console.error('Check limit error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to check limit'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const canCreate = useCallback(async (resourceType: ResourceType): Promise<boolean> => {
    const limit = await checkLimit(resourceType)
    return limit?.can_create ?? false
  }, [checkLimit])

  const checkAndWarn = useCallback(async (resourceType: ResourceType): Promise<{
    canCreate: boolean
    message?: string
  }> => {
    const limit = await checkLimit(resourceType)
    
    if (!limit) {
      return { canCreate: false, message: 'Could not verify subscription limits' }
    }
    
    if (!limit.can_create) {
      return { canCreate: false, message: limit.message }
    }
    
    return { canCreate: true }
  }, [checkLimit])

  return {
    loading,
    error,
    checkLimit,
    canCreate,
    checkAndWarn
  }
}

