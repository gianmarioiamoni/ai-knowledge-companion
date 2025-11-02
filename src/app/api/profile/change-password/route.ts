import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { passwordChangeSchema } from '@/lib/schemas/profile'

export const runtime = 'nodejs'

export async function POST(request: Request) {
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
    const validatedData = passwordChangeSchema.parse(body)

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.new_password
    })

    if (updateError) {
      console.error('Password change error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password change exception:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

