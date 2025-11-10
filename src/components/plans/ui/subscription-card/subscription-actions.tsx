/**
 * Subscription Actions Component
 * Smart component that shows appropriate action based on subscription type
 */

import { JSX } from 'react'
import { useRouter } from '@/i18n/navigation'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PortalButton } from '@/components/stripe'

interface SubscriptionActionsProps {
  status: string
  hasStripeSubscription: boolean // New prop to check if user has Stripe subscription
  changePlanText: string
  manageSubscriptionText: string
}

export function SubscriptionActions({ 
  status,
  hasStripeSubscription,
  changePlanText,
  manageSubscriptionText,
}: SubscriptionActionsProps): JSX.Element {
  const router = useRouter()
  const isActive = status === 'active' || status === 'trial'

  return (
    <CardFooter className="flex flex-col sm:flex-row gap-3">
      {/* 
        Smart Button Logic:
        - If user has Stripe subscription: Show "Manage Subscription" (Stripe Portal)
          → User can change payment method, view invoices, cancel subscription
        - If user has manual/trial subscription: Show "Change Plan" (go to /plans)
          → User can upgrade to a paid plan
      */}
      {isActive && hasStripeSubscription ? (
        // User paid via Stripe - show Portal button
        <div className="flex-1 w-full">
          <PortalButton 
            variant="default"
            className="w-full"
          />
        </div>
      ) : (
        // User on trial or manual plan - show Change Plan button
        <div className="flex-1 w-full">
          <Button 
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => router.push('/plans')}
          >
            {changePlanText}
          </Button>
        </div>
      )}
    </CardFooter>
  )
}

