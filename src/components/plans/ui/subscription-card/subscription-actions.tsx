/**
 * Subscription Actions Component
 * Provides access to Stripe Customer Portal and plan changes
 */

import { JSX } from 'react'
import { useRouter } from '@/i18n/navigation'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PortalButton } from '@/components/stripe'

interface SubscriptionActionsProps {
  status: string
  changePlanText: string
}

export function SubscriptionActions({ 
  status,
  changePlanText,
}: SubscriptionActionsProps): JSX.Element {
  const router = useRouter()
  const isActive = status === 'active' || status === 'trial'

  return (
    <CardFooter className="flex flex-col sm:flex-row gap-3">
      {/* Stripe Customer Portal - Manage subscription, payment methods, invoices */}
      {isActive && (
        <div className="flex-1 w-full">
          <PortalButton variant="default" />
        </div>
      )}
      
      {/* Change Plan - Go to plans page */}
      <div className="flex-1 w-full">
        <Button 
          variant={isActive ? "outline" : "default"}
          size="lg"
          className="w-full"
          onClick={() => router.push('/plans')}
        >
          {changePlanText}
        </Button>
      </div>
    </CardFooter>
  )
}

