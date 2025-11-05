/**
 * Marketplace API - Track View
 * POST /api/marketplace/[id]/view
 * Tracks a view of a marketplace tutor (analytics)
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackTutorView } from '@/lib/supabase/marketplace'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tutorId } = await params
    const supabase = await createClient()
    
    // Get current user (optional - can be anonymous)
    const { data: { user } } = await supabase.auth.getUser()

    // Get or generate session ID from cookies/headers
    const sessionId = request.cookies.get('session_id')?.value || 
                      `anon_${Date.now()}_${Math.random().toString(36)}`

    // Track view
    const result = await trackTutorView({
      tutor_id: tutorId,
      user_id: user?.id,
      session_id: sessionId
    })

    if (result.error) {
      // Don't fail the request if tracking fails
      console.error('View tracking error:', result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('View tracking API error:', error)
    // Don't fail the request
    return NextResponse.json({ success: true })
  }
}

