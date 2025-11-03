'use client';

import { JSX, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MessageBubble } from './message-bubble';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/error';
import type { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  onClearError: () => void;
}

export function ChatMessages({ 
  messages, 
  isLoading, 
  isSending, 
  error, 
  onClearError 
}: ChatMessagesProps): JSX.Element {
  const t = useTranslations('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Error Display */}
      {error && (
        <ErrorAlert
          message={error}
          severity="error"
          onDismiss={onClearError}
          className="mb-4"
          showIcon
        />
      )}

      {/* Messages */}
      {messages.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center min-h-[calc(100%-2rem)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('messages.empty.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('messages.empty.subtitle')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.id}-${index}`}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
          
          {/* Typing Indicator */}
          {isSending && (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">{t('messages.typing')}</span>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center min-h-[calc(100%-2rem)]">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}
