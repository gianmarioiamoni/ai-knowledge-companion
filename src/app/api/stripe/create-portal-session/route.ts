/**
 * API Route: Create Stripe Customer Portal Session
 * POST /api/stripe/create-portal-session
 * 
 * Creates a Stripe Customer Portal session for managing subscriptions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCustomerPortalSession } from '@/lib/stripe'

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

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe to a plan first.' },
        { status: 404 }
      )
    }

    // Create return URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/profile?tab=subscription`

    // Create portal session
    const session = await createCustomerPortalSession(
      profile.stripe_customer_id,
      returnUrl
    )

    // Return portal URL
    return NextResponse.json({
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating portal session:', error)

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

