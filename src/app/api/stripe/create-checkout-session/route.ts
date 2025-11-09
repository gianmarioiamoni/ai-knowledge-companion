/**
 * API Route: Create Stripe Checkout Session
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe checkout session for subscription purchase
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { planName, billingCycle } = body

    // Validate input
    if (!planName || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: planName, billingCycle' },
        { status: 400 }
      )
    }

    if (!['pro', 'enterprise'].includes(planName)) {
      return NextResponse.json(
        { error: 'Invalid plan name. Must be "pro" or "enterprise"' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create URLs for success and cancel
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard?payment=success`
    const cancelUrl = `${baseUrl}/plans?payment=cancelled`

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      userName: profile?.full_name,
      planName,
      billingCycle,
      successUrl,
      cancelUrl,
    })

    // Return session ID and URL
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

