/**
 * Stripe Subscription Management
 * Handles subscription operations and syncing with database
 */

import type Stripe from 'stripe'
import { getStripeServerClient } from './client'
import { createServiceClient } from '@/lib/supabase/service-client'

/**
 * Get Stripe subscription by ID
 */
export async function getStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeServerClient()
  return await stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * List subscriptions for a customer
 */
export async function listCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const stripe = getStripeServerClient()

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
  })

  return subscriptions.data
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  const stripe = getStripeServerClient()

  if (immediately) {
    // Cancel immediately
    return await stripe.subscriptions.cancel(subscriptionId)
  } else {
    // Cancel at period end
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }
}

/**
 * Reactivate a cancelled subscription (before period end)
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeServerClient()

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Update subscription (e.g., change plan)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeServerClient()

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

/**
 * Sync Stripe subscription to database
 */
export async function syncSubscriptionToDatabase(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = createServiceClient()

  // Get user ID from customer metadata or database
  const userId = subscription.metadata.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Get plan info from Stripe price ID
  const priceId = subscription.items.data[0].price.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: planData } = await (supabase as any).rpc('get_plan_by_stripe_price_id', {
    p_stripe_price_id: priceId,
  })

  if (!planData || planData.length === 0) {
    console.error('Plan not found for price ID:', priceId)
    return
  }

  const plan = planData[0]

  // Determine payment method
  const paymentMethod = subscription.default_payment_method
    ? await getPaymentMethodType(subscription.default_payment_method as string)
    : 'card'

  // Determine status
  let status: 'active' | 'trial' | 'cancelled' | 'expired' = 'active'
  if (subscription.status === 'trialing') {
    status = 'trial'
  } else if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
    status = 'cancelled'
  } else if (subscription.status === 'unpaid' || subscription.status === 'past_due') {
    status = 'expired'
  }

  // Calculate end date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endDate = new Date((subscription as any).current_period_end * 1000)

  // Upsert subscription in database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc('upsert_subscription_from_stripe', {
    p_user_id: userId,
    p_plan_name: plan.plan_name,
    p_stripe_subscription_id: subscription.id,
    p_stripe_price_id: priceId,
    p_billing_cycle: plan.billing_cycle,
    p_stripe_payment_method: paymentMethod,
    p_status: status,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p_start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
    p_end_date: endDate.toISOString(),
  })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }
}

/**
 * Get payment method type from Stripe payment method ID
 */
async function getPaymentMethodType(paymentMethodId: string): Promise<string> {
  try {
    const stripe = getStripeServerClient()
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    return paymentMethod.type
  } catch (error) {
    console.error('Error retrieving payment method:', error)
    return 'card'
  }
}

/**
 * Create a Stripe Customer Portal session
 * Allows users to manage their subscription, payment methods, and view invoices
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeServerClient()

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

