import { createClient } from './client';
import { createServiceClient } from './service';
import type { 
  Conversation, 
  ConversationWithTutor, 
  Message, 
  MessageWithRAGContext,
  ConversationInsert,
  MessageInsert,
  ChatConversation,
  ChatMessage,
  ConversationQueryInput,
  MessageQueryInput
} from '@/types/chat';

const supabase = createClient();

// Conversation CRUD operations
export async function createConversation(
  conversation: ConversationInsert
): Promise<{ data?: Conversation; error?: string }> {
  try {
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversation),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Create conversation error:", result);
      return { error: result.error || 'Failed to create conversation' };
    }

    return { data: result.conversation };
  } catch (error) {
    console.error("Create conversation exception:", error);
    return { error: "Failed to create conversation" };
  }
}

export async function getConversations(
  query: ConversationQueryInput = {}
): Promise<{ data?: ChatConversation[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (query.tutor_id) params.append('tutor_id', query.tutor_id);
    if (query.archived !== undefined) params.append('archived', query.archived.toString());
    params.append('limit', query.limit?.toString() || '20');
    params.append('offset', query.offset?.toString() || '0');

    const response = await fetch(`/api/chat/conversations?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      console.error("Get conversations error:", result);
      return { error: result.error || 'Failed to get conversations' };
    }

    return { data: result.conversations };
  } catch (error) {
    console.error("Get conversations exception:", error);
    return { error: "Failed to get conversations" };
  }
}

export async function getConversation(
  id: string
): Promise<{ data?: ConversationWithTutor; error?: string }> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`);
    const result = await response.json();

    if (!response.ok) {
      console.error("Get conversation error:", result);
      return { error: result.error || 'Failed to get conversation' };
    }

    return { data: result.conversation };
  } catch (error) {
    console.error("Get conversation exception:", error);
    return { error: "Failed to get conversation" };
  }
}

export async function updateConversation(
  id: string,
  updates: Partial<ConversationInsert>
): Promise<{ data?: Conversation; error?: string }> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Update conversation error:", result);
      return { error: result.error || 'Failed to update conversation' };
    }

    return { data: result.conversation };
  } catch (error) {
    console.error("Update conversation exception:", error);
    return { error: "Failed to update conversation" };
  }
}

export async function deleteConversation(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Delete conversation error:", result);
      return { success: false, error: result.error || 'Failed to delete conversation' };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete conversation exception:", error);
    return { success: false, error: "Failed to delete conversation" };
  }
}

export async function archiveConversation(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}/archive`, {
      method: 'PATCH',
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Archive conversation error:", result);
      return { success: false, error: result.error || 'Failed to archive conversation' };
    }

    return { success: true };
  } catch (error) {
    console.error("Archive conversation exception:", error);
    return { success: false, error: "Failed to archive conversation" };
  }
}

// Message operations
export async function createMessage(
  message: MessageInsert
): Promise<{ data?: Message; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: message.conversation_id,
        role: message.role,
        sender: message.sender,
        content: message.content,
        tokens_used: message.tokens_used || 0,
        metadata: message.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Exception creating message:', error);
    return { error: 'Failed to create message' };
  }
}

export async function getMessages(
  query: MessageQueryInput
): Promise<{ data?: ChatMessage[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    params.append('conversation_id', query.conversation_id);
    params.append('limit', query.limit?.toString() || '50');
    params.append('offset', query.offset?.toString() || '0');

    const response = await fetch(`/api/chat/messages?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      console.error("Get messages error:", result);
      return { error: result.error || 'Failed to get messages' };
    }

    return { data: result.messages };
  } catch (error) {
    console.error("Get messages exception:", error);
    return { error: "Failed to get messages" };
  }
}

export async function sendMessage(
  message: string,
  conversationId: string,
  tutorId: string
): Promise<{ data?: MessageWithRAGContext; error?: string }> {
  try {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        tutor_id: tutorId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Send message error:", result);
      return { error: result.error || 'Failed to send message' };
    }

    return { data: result.message };
  } catch (error) {
    console.error("Send message exception:", error);
    return { error: "Failed to send message" };
  }
}

// Utility functions
export function transformConversationToChat(conversation: ConversationWithTutor): ChatConversation {
  return {
    id: conversation.id,
    title: conversation.title,
    tutor: {
      id: conversation.tutor_id,
      name: conversation.tutor_name,
      avatar_url: conversation.tutor_avatar_url,
      model: conversation.tutor_model,
    },
    last_message_at: conversation.last_message_at,
    message_count: conversation.message_count,
    is_archived: conversation.is_archived,
  };
}

export function transformMessageToChat(message: MessageWithRAGContext): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.created_at,
    tokens_used: message.tokens_used,
    model: message.model,
    rag_chunks: message.rag_chunks,
  };
}

// Service object for easier imports
export const chatService = {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  archiveConversation,
  getMessages,
  sendMessage,
  transformConversationToChat,
  transformMessageToChat,
};
