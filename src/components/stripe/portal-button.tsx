/**
 * Stripe Customer Portal Button Component
 * Single Responsibility: Open Stripe Customer Portal
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Loader2, Settings } from 'lucide-react'
import { useStripePortal } from '@/hooks/use-stripe-portal'

interface PortalButtonProps {
  disabled?: boolean
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
  showIcon?: boolean
}

export function PortalButton({
  disabled = false,
  variant = 'outline',
  className,
  showIcon = true,
}: PortalButtonProps): JSX.Element {
  const t = useTranslations('plans.payment')
  const { openCustomerPortal, loading, error } = useStripePortal()

  const handleClick = async () => {
    await openCustomerPortal()
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
            {t('processing')}
          </>
        ) : (
          <>
            {showIcon && <Settings className="h-4 w-4 mr-2" />}
            {t('manageSubscription')}
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  )
}

