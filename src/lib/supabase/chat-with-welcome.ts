import { createConversation, createMessage } from './chat'
import { createWelcomeMessageObject } from '../chat/welcome-message'
import type { Tutor } from '@/types/tutors'
import type { Conversation } from '@/types/chat'

interface CreateConversationWithWelcomeParams {
  userId: string
  tutorId: string
  tutor: Tutor
  userEmail?: string
  locale?: string
}

/**
 * Creates a new conversation and automatically sends a welcome message
 * This provides a better UX by introducing the tutor immediately
 */
export async function createConversationWithWelcome({
  userId,
  tutorId,
  tutor,
  userEmail,
  locale = 'en'
}: CreateConversationWithWelcomeParams): Promise<{ 
  data?: { conversation: Conversation; messageId: string }
  error?: string 
}> {
  try {
    // Step 1: Create the conversation
    const { data: conversation, error: convError } = await createConversation({
      user_id: userId,
      tutor_id: tutorId,
      title: `Chat with ${tutor.name}`,
      metadata: {
        tutorName: tutor.name,
        hasWelcomeMessage: true
      }
    })

    if (convError || !conversation) {
      return { error: convError || 'Failed to create conversation' }
    }

    // Step 2: Generate and send welcome message
    const welcomeMsg = createWelcomeMessageObject(tutor, userEmail, locale)
    
    const { data: message, error: msgError } = await createMessage({
      conversation_id: conversation.id,
      role: welcomeMsg.role,
      sender: welcomeMsg.sender,
      content: welcomeMsg.content,
      metadata: welcomeMsg.metadata
    })

    if (msgError || !message) {
      console.error('Failed to create welcome message:', msgError)
      // Don't fail the whole operation, just log
      // User can still use the conversation
    }

    return {
      data: {
        conversation,
        messageId: message?.id || ''
      }
    }
  } catch (error) {
    console.error('Exception in createConversationWithWelcome:', error)
    return { error: 'Failed to create conversation with welcome message' }
  }
}

