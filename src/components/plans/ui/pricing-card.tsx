/**
 * Pricing Card Component - Display plan details and pricing
 */

'use client'

import { JSX, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan } from '@/types/subscription'

interface PricingCardProps {
  plan: SubscriptionPlan
  isCurrentPlan?: boolean
  isMostPopular?: boolean
  onSelectPlan: (planName: string, billingCycle: 'monthly' | 'yearly' | null) => Promise<void>
  t: any // Translation function
}

export function PricingCard({
  plan,
  isCurrentPlan = false,
  isMostPopular = false,
  onSelectPlan,
  t
}: PricingCardProps): JSX.Element {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  const isUnlimitedTutors = plan.max_tutors === -1
  const isFree = plan.name === 'trial'

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  const pricePerMonth = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(2) : null
  const savings = plan.price_monthly * 12 - plan.price_yearly

  const handleSelect = async () => {
    setLoading(true)
    try {
      await onSelectPlan(plan.name, isFree ? null : billingCycle)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      name: t('features.tutors'),
      value: isUnlimitedTutors ? t('unlimited') : plan.max_tutors,
      included: true
    },
    {
      name: t('features.documents'),
      value: plan.max_documents,
      included: true
    },
    {
      name: t('features.audioFiles'),
      value: plan.max_audio_files,
      included: plan.max_audio_files > 0
    },
    {
      name: t('features.videoFiles'),
      value: plan.max_video_files,
      included: plan.max_video_files > 0
    }
  ]

  return (
    <Card className={cn(
      "relative flex flex-col",
      isMostPopular && "border-primary shadow-lg scale-105",
      isCurrentPlan && "border-green-500"
    )}>
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-primary text-primary-foreground flex items-center gap-1 px-3 py-1">
            <Zap className="h-3 w-3" />
            {t('mostPopular')}
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300">
            {t('currentPlan')}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">{plan.display_name}</CardTitle>
        <CardDescription className="mt-2">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Pricing */}
        <div className="text-center">
          {isFree ? (
            <>
              <div className="text-4xl font-bold">$0</div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('freeTrial', { days: plan.trial_days })}
              </div>
            </>
          ) : (
            <>
              {/* Billing Toggle */}
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('monthly')}
                  disabled={loading}
                >
                  {t('monthly')}
                </Button>
                <Button
                  variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('yearly')}
                  disabled={loading}
                >
                  {t('yearly')}
                </Button>
              </div>

              <div className="text-4xl font-bold">
                ${price}
                <span className="text-lg font-normal text-muted-foreground">
                  /{billingCycle === 'monthly' ? t('month') : t('year')}
                </span>
              </div>

              {billingCycle === 'yearly' && pricePerMonth && (
                <div className="text-sm text-muted-foreground mt-1">
                  ${pricePerMonth}/{t('month')} • {t('save')} ${savings}
                </div>
              )}
            </>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-3">
          {features.filter(f => f.included).map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">
                <span className="font-semibold">{feature.value}</span> {feature.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSelect}
          disabled={isCurrentPlan || loading}
          variant={isMostPopular ? 'default' : 'outline'}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isCurrentPlan
            ? t('currentPlan')
            : loading
            ? t('processing')
            : t('selectPlan')
          }
        </Button>
      </CardFooter>
    </Card>
  )
}

