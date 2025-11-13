/**
 * Plan Selection Hook - Manages plan selection and upgrade logic
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSubscription } from './use-subscription'
import { toast } from 'sonner'
import type { PlanName } from '@/types/subscription'

export function usePlanSelection() {
  const t = useTranslations('plans')
  const router = useRouter()
  const { upgradePlan } = useSubscription()
  const [upgrading, setUpgrading] = useState(false)

  const handleSelectPlan = useCallback(
    async (planName: string, billingCycle: 'monthly' | 'yearly' | null) => {
      try {
        setUpgrading(true)
        
        const result = await upgradePlan(planName as PlanName, billingCycle)
        
        if (result.success) {
          toast.success(result.message || t('upgradeSuccess'))
          setTimeout(() => router.push('/profile'), 2000)
        } else {
          toast.error(result.error || t('upgradeError'))
        }
      } catch (_error) {
        toast.error(t('upgradeError'))
      } finally {
        setUpgrading(false)
      }
    },
    [upgradePlan, router, t]
  )

  return {
    handleSelectPlan,
    upgrading
  }
}

