/**
 * Billing Cycle Toggle Component
 */

import { JSX } from 'react'
import { Button } from '@/components/ui/button'

type TranslationFunction = (key: string) => string

interface BillingToggleProps {
  billingCycle: 'monthly' | 'yearly'
  onChangeCycle: (cycle: 'monthly' | 'yearly') => void
  loading: boolean
  t: TranslationFunction
}

export function BillingToggle({ billingCycle, onChangeCycle, loading, t }: BillingToggleProps): JSX.Element {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <Button
        variant={billingCycle === 'monthly' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChangeCycle('monthly')}
        disabled={loading}
      >
        {t('monthly')}
      </Button>
      <Button
        variant={billingCycle === 'yearly' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChangeCycle('yearly')}
        disabled={loading}
      >
        {t('yearly')}
      </Button>
    </div>
  )
}

