/**
 * Check Usage Limit API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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
    
    // Get resource type from query params
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('type')
    
    if (!resourceType || !['tutors', 'documents', 'audio', 'video'].includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type. Must be: tutors, documents, audio, or video' },
        { status: 400 }
      )
    }
    
    // Check usage limit using RPC function
    const { data, error } = await supabase
      .rpc('check_usage_limit', {
        p_user_id: user.id,
        p_resource_type: resourceType
      })
    
    if (error) {
      console.error('Error checking usage limit:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Could not check usage limit' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ limit: data[0] })
  } catch (error) {
    console.error('Usage limit API error:', error)
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    )
  }
}

