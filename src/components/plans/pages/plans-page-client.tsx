/**
 * Plans Page Client Component
 */

'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { usePlans } from '@/hooks/use-plans'
import { useSubscription } from '@/hooks/use-subscription'
import { PricingCard } from '../ui/pricing-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function PlansPageClient(): JSX.Element {
  const t = useTranslations('plans')
  const router = useRouter()
  const { plans, loading: plansLoading } = usePlans()
  const { subscription, loading: subLoading, upgradePlan } = useSubscription()
  const [upgrading, setUpgrading] = useState(false)

  const loading = plansLoading || subLoading

  const handleSelectPlan = async (planName: string, billingCycle: 'monthly' | 'yearly' | null) => {
    try {
      setUpgrading(true)
      
      const result = await upgradePlan(planName as any, billingCycle)
      
      if (result.success) {
        toast.success(result.message || t('upgradeSuccess'))
        setTimeout(() => router.push('/profile'), 2000)
      } else {
        toast.error(result.error || t('upgradeError'))
      }
    } catch (error) {
      toast.error(t('upgradeError'))
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Current Plan Info */}
        {subscription && subscription.status !== 'expired' && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {t('currentPlanInfo.title')}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {t('currentPlanInfo.description', {
                    plan: subscription.plan_display_name,
                    days: subscription.days_remaining
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription?.plan_id === plan.id}
              isMostPopular={plan.name === 'pro'}
              onSelectPlan={handleSelectPlan}
              t={t}
            />
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('faq.title')}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('faq.question1')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('faq.answer1')}
              </p>
            </div>
            <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('faq.question2')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('faq.answer2')}
              </p>
            </div>
            <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('faq.question3')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('faq.answer3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

