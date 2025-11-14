/**
 * Stripe Client Initialization
 * Provides singleton instances of Stripe clients for server and client-side usage
 */

import Stripe from 'stripe'
import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js'

/**
 * Server-side Stripe client
 * Use this for API routes and server-side operations
 */
export function getStripeServerClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  })
}

/**
 * Client-side Stripe promise
 * Use this for frontend Stripe.js operations (e.g., redirectToCheckout)
 */
let stripePromise: Promise<StripeClient | null>

export function getStripeClientPromise(): Promise<StripeClient | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

/**
 * Get Stripe price IDs from environment variables
 */
export function getStripePriceIds() {
  return {
    proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    proYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    enterpriseMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    enterpriseYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  }
}

/**
 * Map plan name and billing cycle to Stripe price ID
 */
export function getPriceIdForPlan(
  planName: 'pro' | 'enterprise',
  billingCycle: 'monthly' | 'yearly'
): string {
  const priceIds = getStripePriceIds()

  const key = `${planName}${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}` as keyof typeof priceIds
  const priceId = priceIds[key]

  if (!priceId) {
    throw new Error(`Stripe Price ID not found for ${planName} ${billingCycle}`)
  }

  return priceId
}

/**
 * Validate Stripe webhook signature
 */
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeServerClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    throw new Error(`Webhook signature verification failed: ${error.message}`)
  }
}

