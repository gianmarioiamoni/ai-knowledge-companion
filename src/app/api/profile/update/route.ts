import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { profileUpdateSchema } from '@/lib/schemas/profile'

export const runtime = 'nodejs'

export async function PATCH(request: Request) {
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update exception:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

