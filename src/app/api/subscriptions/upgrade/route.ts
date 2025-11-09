/**
 * Upgrade/Change Subscription Plan API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
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
    
    const { planName, billingCycle } = await request.json()
    
    if (!planName || !['trial', 'pro', 'enterprise'].includes(planName)) {
      return NextResponse.json(
        { error: 'Invalid plan name' },
        { status: 400 }
      )
    }
    
    if (planName !== 'trial' && (!billingCycle || !['monthly', 'yearly'].includes(billingCycle))) {
      return NextResponse.json(
        { error: 'Billing cycle required for paid plans (monthly or yearly)' },
        { status: 400 }
      )
    }
    
    // Get target plan
    const { data: targetPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single()
    
    if (planError || !targetPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }
    
    // Get current subscription
    const { data: currentSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // Calculate end date
    const startDate = new Date()
    let endDate: Date
    
    if (planName === 'trial') {
      endDate = new Date(startDate.getTime() + targetPlan.trial_days * 24 * 60 * 60 * 1000)
    } else if (billingCycle === 'monthly') {
      endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
    } else { // yearly
      endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + 1)
    }
    
    // Use service client for subscription management
    const serviceClient = createServiceClient()
    
    // Update or create subscription
    if (currentSub) {
      const { error: updateError } = await serviceClient
        .from('user_subscriptions')
        .update({
          plan_id: targetPlan.id,
          status: planName === 'trial' ? 'trial' : 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          trial_end_date: planName === 'trial' ? endDate.toISOString() : null,
          billing_cycle: planName === 'trial' ? null : billingCycle,
          next_payment_date: planName === 'trial' ? null : endDate.toISOString(),
          cancelled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await serviceClient
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: targetPlan.id,
          status: planName === 'trial' ? 'trial' : 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          trial_end_date: planName === 'trial' ? endDate.toISOString() : null,
          billing_cycle: planName === 'trial' ? null : billingCycle,
          next_payment_date: planName === 'trial' ? null : endDate.toISOString()
        })
      
      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${targetPlan.display_name} plan`
    })
  } catch (error) {
    console.error('Upgrade subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}

