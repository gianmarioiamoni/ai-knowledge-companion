'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';
import { chatService } from '@/lib/supabase/chat';
import { createConversationWithWelcome } from '@/lib/supabase/chat-with-welcome';
import type { 
  ChatState, 
  ChatActions, 
  ChatConversation, 
  ChatMessage,
  ConversationQueryInput 
} from '@/types/chat';
import type { Tutor } from '@/types/tutors';

export function useChat(tutorId?: string, tutor?: Tutor, locale?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
  });

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const query: ConversationQueryInput = {};
      if (tutorId) {
        query.tutor_id = tutorId;
      }

      const result = await chatService.getConversations(query);

      if (result.error) {
        setState(prev => ({ ...prev, error: result.error!, isLoading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        conversations: result.data || [],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load conversations',
        isLoading: false,
      }));
    }
  }, [user, tutorId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await chatService.getMessages({
        conversation_id: conversationId,
        limit: 100,
        offset: 0,
      });

      if (result.error) {
        setState(prev => ({ ...prev, error: result.error!, isLoading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        messages: result.data || [],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      }));
    }
  }, [user]);

  // Create a new conversation (with welcome message if tutor is provided)
  const createConversation = useCallback(async (
    targetTutorId: string, 
    title?: string
  ): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setState(prev => ({ ...prev, isSending: true, error: null }));

    try {
      // If tutor info is available, create conversation with welcome message
      if (tutor && targetTutorId === tutor.id) {
        const result = await createConversationWithWelcome({
          tutorId: targetTutorId,
          tutor,
          userEmail: user.email,
          locale
        });

        if (result.error) {
          setState(prev => ({ ...prev, error: result.error!, isSending: false }));
          return { success: false, error: result.error };
        }

        if (result.data) {
          // Add to conversations list
          setState(prev => ({
            ...prev,
            conversations: [chatService.transformConversationToChat(result.data!.conversation), ...prev.conversations],
            currentConversation: result.data!.conversation.id,
            isSending: false,
          }));

          // Load messages to show welcome message
          await loadMessages(result.data.conversation.id);

          return { success: true, conversationId: result.data.conversation.id };
        }
      } else {
        // Fallback to regular conversation creation
        const result = await chatService.createConversation({
          tutor_id: targetTutorId,
          title: title || 'New Conversation',
        });

        if (result.error) {
          setState(prev => ({ ...prev, error: result.error!, isSending: false }));
          return { success: false, error: result.error };
        }

        if (result.data) {
          setState(prev => ({
            ...prev,
            conversations: [chatService.transformConversationToChat(result.data!), ...prev.conversations],
            currentConversation: result.data!.id,
            isSending: false,
          }));

          return { success: true, conversationId: result.data.id };
        }
      }

      return { success: false, error: 'Failed to create conversation' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      setState(prev => ({ ...prev, error: errorMessage, isSending: false }));
      return { success: false, error: errorMessage };
    }
  }, [user, tutor, locale, loadMessages]);

  // Send a message
  const sendMessage = useCallback(async (content: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !state.currentConversation) {
      return { success: false, error: 'No active conversation' };
    }

    if (!tutorId) {
      return { success: false, error: 'Tutor ID required' };
    }

    setState(prev => ({ ...prev, isSending: true, error: null }));

    try {
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      const result = await chatService.sendMessage(
        content,
        state.currentConversation,
        tutorId
      );

      if (result.error) {
        // Remove the temporary user message on error
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== userMessage.id),
          error: result.error!,
          isSending: false,
        }));
        return { success: false, error: result.error };
      }

      if (result.data) {
        // Replace temporary message with real user message and add assistant response
        const realUserMessage = chatService.transformMessageToChat({
          ...result.data,
          role: 'user',
          content,
        } as any);

        const assistantMessage = chatService.transformMessageToChat(result.data);

        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages.filter(m => m.id !== userMessage.id),
            realUserMessage,
            assistantMessage,
          ],
          isSending: false,
        }));

        // Update conversation in list
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv =>
            conv.id === state.currentConversation
              ? { ...conv, message_count: conv.message_count + 2 }
              : conv
          ),
        }));

        return { success: true };
      }

      return { success: false, error: 'Failed to send message' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== `temp-${Date.now()}`),
        error: errorMessage,
        isSending: false,
      }));
      return { success: false, error: errorMessage };
    }
  }, [user, state.currentConversation, tutorId]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await chatService.deleteConversation(conversationId);

      if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }));
        return { success: false, error: result.error };
      }

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(conv => conv.id !== conversationId),
        currentConversation: prev.currentConversation === conversationId ? null : prev.currentConversation,
        messages: prev.currentConversation === conversationId ? [] : prev.messages,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete conversation';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Archive a conversation
  const archiveConversation = useCallback(async (conversationId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await chatService.archiveConversation(conversationId);

      if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }));
        return { success: false, error: result.error };
      }

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, is_archived: true }
            : conv
        ),
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive conversation';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Set current conversation
  const setCurrentConversation = useCallback((conversationId: string | null) => {
    setState(prev => ({
      ...prev,
      currentConversation: conversationId,
      messages: conversationId ? prev.messages : [],
    }));

    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [loadMessages]);

  // Delete all conversations
  const deleteAllConversations = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await chatService.deleteAllConversations(tutorId);

      if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }));
        return { success: false, error: result.error };
      }

      setState(prev => ({
        ...prev,
        conversations: [],
        currentConversation: null,
        messages: [],
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete all conversations';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [user, tutorId]);

  // Archive all conversations
  const archiveAllConversations = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await chatService.archiveAllConversations(tutorId);

      if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }));
        return { success: false, error: result.error };
      }

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => ({ ...conv, is_archived: true })),
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive all conversations';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [user, tutorId]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const actions: ChatActions = {
    createConversation,
    loadConversations,
    loadMessages,
    sendMessage,
    deleteConversation,
    archiveConversation,
    deleteAllConversations,
    archiveAllConversations,
    setCurrentConversation,
    clearError,
  };

  return {
    ...state,
    ...actions,
  };
}
