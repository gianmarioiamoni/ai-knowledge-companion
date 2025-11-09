/**
 * Cancel Subscription API
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST() {
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
    
    // Get current subscription
    const { data: currentSub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (subError || !currentSub) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Don't allow cancelling trial (they should just let it expire)
    if (currentSub.status === 'trial') {
      return NextResponse.json(
        { error: 'Cannot cancel trial subscription. It will expire automatically.' },
        { status: 400 }
      )
    }
    
    // Use service client to cancel subscription
    const serviceClient = createServiceClient()
    
    const { error: cancelError } = await serviceClient
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (cancelError) {
      console.error('Error cancelling subscription:', cancelError)
      return NextResponse.json(
        { error: cancelError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. You will have access until the end of your billing period.'
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

