import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/user/export-data
 * Export all user data in JSON format (GDPR compliance)
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Collect all user data
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      profile: {
        email: user.email,
        createdAt: user.created_at,
        metadata: user.user_metadata,
      },
    }

    // Get user's tutors
    const { data: tutors } = await supabase
      .from('tutors')
      .select('*')
      .eq('owner_id', user.id)
    exportData.tutors = tutors || []

    // Get user's documents
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('owner_id', user.id)
    exportData.documents = documents || []

    // Get user's chat conversations
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
    exportData.conversations = conversations || []

    // Get user's chat messages
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
    exportData.messages = messages || []

    // Get user's subscription info (if exists)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    exportData.subscription = subscription || null

    // Get user's usage stats
    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()
    exportData.usage = usage || null

    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2)

    // Return as downloadable file
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${user.id}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

