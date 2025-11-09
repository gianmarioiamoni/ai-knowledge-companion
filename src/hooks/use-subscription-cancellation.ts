/**
 * Subscription Cancellation Hook
 */

'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useSubscription } from './use-subscription'
import { toast } from 'sonner'

export function useSubscriptionCancellation() {
  const t = useTranslations('plans')
  const { cancelSubscription } = useSubscription()
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = useCallback(async () => {
    setCancelling(true)
    try {
      const result = await cancelSubscription()
      if (result.success) {
        toast.success(result.message || t('cancelSuccess'))
      } else {
        toast.error(result.error || t('cancelError'))
      }
    } finally {
      setCancelling(false)
    }
  }, [cancelSubscription, t])

  return {
    cancelling,
    handleCancel
  }
}

