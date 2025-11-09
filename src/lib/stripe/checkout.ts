/**
 * Stripe Checkout Session Management
 * Handles creation of checkout sessions for subscription purchases
 */

import type Stripe from 'stripe'
import { getStripeServerClient, getPriceIdForPlan } from './client'
import { getOrCreateStripeCustomer } from './customer'

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  userName?: string
  planName: 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}

/**
 * Create a Stripe Checkout session for subscription purchase
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeServerClient()

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    params.userId,
    params.userEmail,
    params.userName
  )

  // Get Stripe price ID for the selected plan and billing cycle
  const priceId = getPriceIdForPlan(params.planName, params.billingCycle)

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card', 'paypal'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      user_id: params.userId,
      plan_name: params.planName,
      billing_cycle: params.billingCycle,
    },
    subscription_data: {
      metadata: {
        user_id: params.userId,
        plan_name: params.planName,
        billing_cycle: params.billingCycle,
      },
    },
  })

  return session
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeServerClient()
  return await stripe.checkout.sessions.retrieve(sessionId)
}

/**
 * List all checkout sessions for a customer
 */
export async function listCheckoutSessions(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Checkout.Session[]> {
  const stripe = getStripeServerClient()

  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit,
  })

  return sessions.data
}

