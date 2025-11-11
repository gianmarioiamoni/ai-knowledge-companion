/**
 * Price Display Component
 */

import { JSX } from 'react'
import type { PricingInfo } from '@/lib/utils/pricing'
import { BillingToggle } from './billing-toggle'

interface PriceDisplayProps {
  pricingInfo: PricingInfo
  billingCycle: 'monthly' | 'yearly'
  onChangeCycle: (cycle: 'monthly' | 'yearly') => void
  loading: boolean
  trialDays: number
  t: any
}

export function PriceDisplay({ 
  pricingInfo, 
  billingCycle, 
  onChangeCycle, 
  loading, 
  trialDays, 
  t 
}: PriceDisplayProps): JSX.Element {
  const { price, pricePerMonth, savings, isFree } = pricingInfo

  if (isFree) {
    return (
      <div className="text-center">
        <div className="text-4xl font-bold">€0</div>
        <div className="text-sm text-muted-foreground mt-1">
          {t('freeTrial', { days: trialDays })}
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <BillingToggle 
        billingCycle={billingCycle}
        onChangeCycle={onChangeCycle}
        loading={loading}
        t={t}
      />

      <div className="text-4xl font-bold">
        €{price}
        <span className="text-lg font-normal text-muted-foreground">
          /{billingCycle === 'monthly' ? t('month') : t('year')}
        </span>
      </div>

      {billingCycle === 'yearly' && pricePerMonth && (
        <div className="text-sm text-muted-foreground mt-1">
          €{pricePerMonth}/{t('month')} • {t('save')} €{savings}
        </div>
      )}
    </div>
  )
}

