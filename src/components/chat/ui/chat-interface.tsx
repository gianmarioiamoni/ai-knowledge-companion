'use client';

import { JSX, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ChatSidebar } from './chat-sidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { ChatInterfaceProps } from '@/types/chat';

export function ChatInterface({ 
  tutorId, 
  conversationId,
  tutor,
  locale,
  onClose 
}: ChatInterfaceProps): JSX.Element {
  const t = useTranslations('chat');
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    createConversation,
    loadMessages,
    sendMessage,
    setCurrentConversation,
    renameConversation,
    deleteConversation,
    archiveConversation,
    deleteAllConversations,
    archiveAllConversations,
    clearError,
  } = useChat(tutorId, tutor, locale);

  // Load initial conversation or create new one
  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId);
    } else if (tutorId && conversations.length === 0 && !isLoading) {
      // Auto-create conversation if none exists
      createConversation(tutorId, 'New Conversation');
    }
  }, [conversationId, tutorId, conversations.length, isLoading, createConversation, setCurrentConversation]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) {
      // Create new conversation if none exists
      const result = await createConversation(tutorId, 'New Conversation');
      if (!result.success) {
        return;
      }
    }

    await sendMessage(content);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversation}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={renameConversation}
          onDeleteConversation={deleteConversation}
          onArchiveConversation={archiveConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversationId={currentConversation}
              onClose={onClose}
              onDeleteAllConversations={deleteAllConversations}
              onArchiveAllConversations={archiveAllConversations}
            />

            {/* Messages */}
            <div className="flex-1 min-h-0">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isSending={isSending}
                error={error}
                onClearError={clearError}
              />
            </div>

            {/* Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isSending}
              placeholder={t('input.placeholder')}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('noConversation.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('noConversation.subtitle')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
