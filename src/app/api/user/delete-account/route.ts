import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/user/delete-account
 * Permanently delete user account and all associated data (GDPR compliance)
 */
export async function DELETE() {
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

    console.log(`🗑️  Deleting account for user: ${user.id}`)

    // Delete user's data in order (respecting foreign key constraints)
    
    // 1. Delete chat messages
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError)
    }

    // 2. Delete chat conversations
    const { error: conversationsError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', user.id)

    if (conversationsError) {
      console.error('Error deleting chat conversations:', conversationsError)
    }

    // 3. Delete tutor-multimedia associations
    const { data: tutors } = await supabase
      .from('tutors')
      .select('id')
      .eq('owner_id', user.id)

    if (tutors && tutors.length > 0) {
      const tutorIds = tutors.map(t => t.id)
      const { error: tutorMultimediaError } = await supabase
        .from('tutor_multimedia')
        .delete()
        .in('tutor_id', tutorIds)

      if (tutorMultimediaError) {
        console.error('Error deleting tutor multimedia:', tutorMultimediaError)
      }
    }

    // 4. Delete tutor-document associations
    if (tutors && tutors.length > 0) {
      const tutorIds = tutors.map(t => t.id)
      const { error: tutorDocsError } = await supabase
        .from('tutor_documents')
        .delete()
        .in('tutor_id', tutorIds)

      if (tutorDocsError) {
        console.error('Error deleting tutor documents:', tutorDocsError)
      }
    }

    // 5. Delete document chunks
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .delete()
      .eq('user_id', user.id)

    if (chunksError) {
      console.error('Error deleting document chunks:', chunksError)
    }

    // 6. Delete documents
    const { data: documents } = await supabase
      .from('documents')
      .select('storage_path, media_type')
      .eq('owner_id', user.id)

    if (documents && documents.length > 0) {
      // Delete from storage buckets
      for (const doc of documents) {
        if (doc.storage_path) {
          const bucket = doc.media_type === 'audio' ? 'audio' : 
                        doc.media_type === 'video' ? 'videos' :
                        doc.media_type === 'image' ? 'images' : 'documents'
          
          await supabase.storage
            .from(bucket)
            .remove([doc.storage_path])
        }
      }

      // Delete from database
      const { error: docsError } = await supabase
        .from('documents')
        .delete()
        .eq('owner_id', user.id)

      if (docsError) {
        console.error('Error deleting documents:', docsError)
      }
    }

    // 7. Delete tutors
    const { error: tutorsError } = await supabase
      .from('tutors')
      .delete()
      .eq('owner_id', user.id)

    if (tutorsError) {
      console.error('Error deleting tutors:', tutorsError)
    }

    // 8. Delete subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (subscriptionError) {
      console.error('Error deleting subscription:', subscriptionError)
    }

    // 9. Delete usage stats
    const { error: usageError } = await supabase
      .from('user_usage')
      .delete()
      .eq('user_id', user.id)

    if (usageError) {
      console.error('Error deleting usage stats:', usageError)
    }

    // 10. Delete media processing queue
    const { error: queueError } = await supabase
      .from('media_processing_queue')
      .delete()
      .eq('user_id', user.id)

    if (queueError) {
      console.error('Error deleting processing queue:', queueError)
    }

    // 11. Finally, delete the auth user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully deleted account for user: ${user.id}`)

    return NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

