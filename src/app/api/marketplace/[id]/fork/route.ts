/**
 * Marketplace API - Fork Tutor
 * POST /api/marketplace/[id]/fork
 * Creates a copy of a marketplace tutor for the current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { forkTutor } from '@/lib/supabase/marketplace'
import { createClient } from '@/lib/supabase/server'

interface ForkRequest {
  newName?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tutorId } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: ForkRequest = await request.json()

    // Fork the tutor
    const result = await forkTutor(tutorId, user.id, body.newName)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fork tutor' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tutor: result.forked_tutor,
      fork_record: result.fork_record
    })
  } catch (error) {
    console.error('Fork tutor API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

