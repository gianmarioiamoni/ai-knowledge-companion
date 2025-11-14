/**
 * Stripe Customer Management
 * Handles creation and retrieval of Stripe customers
 */

import type Stripe from 'stripe'
import { getStripeServerClient } from './client'
import { createServiceClient } from '@/lib/supabase/service-client'

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const supabase = createServiceClient()
  const stripe = getStripeServerClient()

  // Check if user already has a Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single<{ stripe_customer_id: string | null }>()

  if (profile?.stripe_customer_id) {
    // Verify customer exists in Stripe
    try {
      await stripe.customers.retrieve(profile.stripe_customer_id)
      return profile.stripe_customer_id
    } catch (error) {
      console.error('Stripe customer not found, creating new one:', error)
      // Customer doesn't exist in Stripe, create a new one
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      supabase_user_id: userId,
    },
  })

  // Store customer ID in database
  /* eslint-disable @typescript-eslint/no-explicit-any */
  await (supabase
    .from('profiles') as any)
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return customer.id
}

/**
 * Get Stripe customer by ID
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  const stripe = getStripeServerClient()
  return await stripe.customers.retrieve(customerId)
}

/**
 * Update Stripe customer information
 */
export async function updateStripeCustomer(
  customerId: string,
  data: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  const stripe = getStripeServerClient()
  return await stripe.customers.update(customerId, data)
}

/**
 * Get user ID from Stripe customer ID
 */
export async function getUserIdFromStripeCustomer(
  customerId: string
): Promise<string | null> {
  const supabase = createServiceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single<{ id: string }>()

  return profile?.id || null
}

