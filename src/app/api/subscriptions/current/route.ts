/**
 * User Subscription API - Get current user subscription
 * Note: Admins (admin/super_admin) don't have subscriptions - returns null
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
    
    // Check user role first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }
    
    // Admins don't have subscriptions (they have unlimited access)
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      return NextResponse.json({ subscription: null })
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
    
    // If no subscription found, return null (should have been assigned trial automatically)
    if (!data || data.length === 0) {
      return NextResponse.json({ subscription: null })
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

