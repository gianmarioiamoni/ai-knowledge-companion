/**
 * API Route: Stripe Webhook Handler
 * POST /api/webhooks/stripe
 * 
 * Handles incoming Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { validateWebhookSignature, handleStripeWebhook } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Get raw body as text
    const body = await request.text()

    // Get Stripe signature from headers
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ No stripe-signature header found')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Validate and construct event
    let event
    try {
      event = validateWebhookSignature(body, signature)
    } catch (err) {
      const error = err as Error
      console.error('❌ Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    try {
      await handleStripeWebhook(event)
      console.log(`✅ Successfully handled ${event.type}`)
    } catch (err) {
      console.error(`❌ Error handling ${event.type}:`, err)
      // Still return 200 to acknowledge receipt
      // Stripe will retry failed webhooks automatically
    }

    // Return success response
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook handler error:', error)

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs'

