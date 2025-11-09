/**
 * User Subscription API - Get current user subscription
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user subscription with plan details using RPC function
    const { data, error } = await supabase
      .rpc('get_user_subscription', { p_user_id: user.id })
    
    if (error) {
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // If no subscription found, user should have been assigned trial automatically
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ subscription: data[0] })
  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

