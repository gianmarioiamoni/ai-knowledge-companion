/**
 * Marketplace API - Tutor Details
 * GET /api/marketplace/[id]
 * Returns detailed information about a marketplace tutor
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTutorDetails } from '@/lib/supabase/marketplace'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    const result = await getTutorDetails(id, user?.id)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Tutor details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

