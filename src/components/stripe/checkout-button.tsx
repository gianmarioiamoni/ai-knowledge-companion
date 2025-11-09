/**
 * Stripe Checkout Button Component
 * Single Responsibility: Initiate Stripe checkout session
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { useStripeCheckout, type CheckoutParams } from '@/hooks/use-stripe-checkout'

interface CheckoutButtonProps {
  planName: 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
  disabled?: boolean
  variant?: 'default' | 'outline'
  className?: string
  showIcon?: boolean
}

export function CheckoutButton({
  planName,
  billingCycle,
  disabled = false,
  variant = 'default',
  className,
  showIcon = true,
}: CheckoutButtonProps): JSX.Element {
  const t = useTranslations('plans.payment')
  const { createCheckoutSession, loading, error } = useStripeCheckout()

  const handleClick = async () => {
    const params: CheckoutParams = {
      planName,
      billingCycle,
    }
    await createCheckoutSession(params)
  }

  return (
    <div className="w-full">
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        variant={variant}
        size="lg"
        className={className || 'w-full'}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('redirecting')}
          </>
        ) : (
          <>
            {showIcon && <CreditCard className="h-4 w-4 mr-2" />}
            {t('subscribe')}
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-2 text-center">
          {error}
        </p>
      )}

      {!loading && !error && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('secure')}
        </p>
      )}
    </div>
  )
}

