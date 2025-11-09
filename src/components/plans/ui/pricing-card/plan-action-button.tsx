/**
 * Plan Action Button Component
 * Handles both Stripe checkout (for paid plans) and selection (for trial)
 */

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { CheckoutButton } from '@/components/stripe'

interface PlanActionButtonProps {
  planName: string
  billingCycle: 'monthly' | 'yearly'
  isCurrentPlan: boolean
  isMostPopular: boolean
  isSelected: boolean
  isFree: boolean
  loading: boolean
  onSelect: () => void
  t: any
}

export function PlanActionButton({ 
  planName,
  billingCycle,
  isCurrentPlan, 
  isMostPopular, 
  isSelected,
  isFree,
  loading, 
  onSelect, 
  t 
}: PlanActionButtonProps): JSX.Element {
  // For paid plans (Pro, Enterprise), use Stripe checkout
  if (!isFree && !isCurrentPlan && (planName === 'pro' || planName === 'enterprise')) {
    return (
      <CardFooter>
        <CheckoutButton
          planName={planName as 'pro' | 'enterprise'}
          billingCycle={billingCycle}
          disabled={isCurrentPlan}
          variant={isSelected ? 'default' : 'outline'}
        />
      </CardFooter>
    )
  }

  // For trial plan or current plan, use regular button
  return (
    <CardFooter>
      <Button
        className="w-full"
        size="lg"
        onClick={onSelect}
        disabled={isCurrentPlan || loading}
        variant={isSelected ? 'default' : 'outline'}
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
  )
}

