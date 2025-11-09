/**
 * Subscription Card State Hook
 * Manages state and logic for determining what to display in SubscriptionCard
 */

'use client'

import { useSubscription } from './use-subscription'
import { useSubscriptionCancellation } from './use-subscription-cancellation'
import { useRole } from './use-role'

export type SubscriptionCardState = 
  | { type: 'loading' }
  | { type: 'admin'; isAdmin: true }
  | { type: 'empty'; isAdmin: false }
  | { 
      type: 'active';
      isAdmin: false;
      subscription: NonNullable<ReturnType<typeof useSubscription>['subscription']>;
      cancelling: boolean;
      handleCancel: () => void;
    }

export function useSubscriptionCardState() {
  // Check user role
  const { isAdmin, loading: roleLoading } = useRole()
  
  // Data fetching
  const { subscription, loading: subscriptionLoading } = useSubscription()
  
  // Business logic (delegated to hook)
  const { cancelling, handleCancel } = useSubscriptionCancellation()

  // Determine state
  const loading = roleLoading || subscriptionLoading
  
  if (loading) {
    return { type: 'loading' as const }
  }

  if (isAdmin) {
    return { type: 'admin' as const, isAdmin: true as const }
  }

  if (!subscription) {
    return { type: 'empty' as const, isAdmin: false as const }
  }

  return {
    type: 'active' as const,
    isAdmin: false as const,
    subscription,
    cancelling,
    handleCancel
  }
}

