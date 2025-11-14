/**
 * Stripe Webhook Event Handlers
 * Processes Stripe webhook events and syncs data to database
 */

import type Stripe from 'stripe'
import { syncSubscriptionToDatabase } from './subscription'
import { createServiceClient } from '@/lib/supabase/service-client'

/**
 * Handle checkout.session.completed event
 * Fired when a customer completes the checkout process
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('🎉 Checkout session completed:', session.id)

  // Get subscription ID from session
  const subscriptionId = session.subscription as string

  if (!subscriptionId) {
    console.error('No subscription ID in checkout session')
    return
  }

  // The subscription will be synced via the customer.subscription.created event
  console.log('✅ Waiting for subscription.created event to sync subscription')
}

/**
 * Handle customer.subscription.created event
 * Fired when a new subscription is created
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('📝 Subscription created:', subscription.id)

  try {
    await syncSubscriptionToDatabase(subscription)
    console.log('✅ Subscription synced to database')
  } catch (error) {
    console.error('❌ Error syncing subscription:', error)
    throw error
  }
}

/**
 * Handle customer.subscription.updated event
 * Fired when a subscription is updated (plan change, payment method update, etc.)
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('🔄 Subscription updated:', subscription.id)

  try {
    await syncSubscriptionToDatabase(subscription)
    
    // Check if there's a scheduled plan change
    if (subscription.schedule) {
      console.log('📅 Subscription has a schedule:', subscription.schedule)
      // The schedule details will be handled in subscription_schedule events
    }
    
    console.log('✅ Subscription update synced to database')
  } catch (error) {
    console.error('❌ Error syncing subscription update:', error)
    throw error
  }
}

/**
 * Handle customer.subscription.deleted event
 * Fired when a subscription is cancelled/deleted
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('🗑️  Subscription deleted:', subscription.id)

  const supabase = createServiceClient()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('cancel_subscription_from_stripe', {
      p_stripe_subscription_id: subscription.id,
    })
    console.log('✅ Subscription cancellation synced to database')
  } catch (error) {
    console.error('❌ Error syncing subscription cancellation:', error)
    throw error
  }
}

/**
 * Handle invoice.paid event
 * Fired when an invoice is successfully paid (including recurring payments)
 */
export async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<void> {
  console.log('💰 Invoice paid:', invoice.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string

  if (!subscriptionId) {
    console.log('⚠️  No subscription associated with invoice')
    return
  }

  // Update subscription's last_payment_date
  const supabase = createServiceClient()

  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (supabase
      .from('user_subscriptions') as any)
      .update({
        last_payment_date: new Date(invoice.created * 1000).toISOString(),
        next_payment_date: (invoice as any).next_payment_attempt
          ? new Date((invoice as any).next_payment_attempt * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    console.log('✅ Payment info updated in database')
    
    // Check for proration (plan change mid-cycle)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasProration = invoice.lines.data.some(line => (line as any).proration)
    if (hasProration) {
      const prorationAmount = invoice.lines.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter(line => (line as any).proration)
        .reduce((sum, line) => sum + (line.amount / 100), 0)
      
      console.log('💵 Proration detected:', prorationAmount, invoice.currency.toUpperCase())
      
      // Store proration info in a metadata field or separate table for notification
      // For now, we'll log it - the frontend can detect upgrades via webhook metadata
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data: subscription } = await (supabase
        .from('user_subscriptions') as any)
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single()
      
      if (subscription?.user_id) {
        // Store proration notification in profiles metadata
        await (supabase
          .from('profiles') as any)
          .update({
            metadata: {
              last_proration: {
                amount: prorationAmount,
                currency: invoice.currency.toUpperCase(),
                date: new Date().toISOString(),
                invoice_id: invoice.id
              }
            }
          })
          .eq('id', subscription.user_id)
        /* eslint-enable @typescript-eslint/no-explicit-any */
        
        console.log('✅ Proration info stored for user:', subscription.user_id)
      }
    }
  } catch (error) {
    console.error('❌ Error updating payment info:', error)
  }
}

/**
 * Handle invoice.payment_failed event
 * Fired when an invoice payment attempt fails
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  console.log('❌ Invoice payment failed:', invoice.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string

  if (!subscriptionId) {
    console.log('⚠️  No subscription associated with invoice')
    return
  }

  // Optionally: Send email notification to user about failed payment
  // Optionally: Update subscription status to 'past_due' or similar

  const supabase = createServiceClient()

  try {
    // Get user info
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data: subscription } = await (supabase
      .from('user_subscriptions') as any)
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (subscription) {
      console.log('⚠️  Payment failed for user:', subscription.user_id)
      // TODO: Send email notification
      // TODO: Update status if needed
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error)
  }
}

/**
 * Main webhook event router
 * Routes Stripe events to appropriate handlers
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log('📨 Received Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`❌ Error handling webhook event ${event.type}:`, error)
    throw error
  }
}

