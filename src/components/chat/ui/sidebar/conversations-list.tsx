'use client';

import { JSX } from 'react';
import { ConversationItem } from './conversation-item';
import type { ChatConversation } from '@/types/chat';

interface ConversationsListProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (conversation: { id: string; title: string }) => void;
  onDeleteConversation: (id: string) => void;
  onArchiveConversation: (id: string) => void;
  formatLastMessage: (timestamp: string) => string;
}

export function ConversationsList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onArchiveConversation,
  formatLastMessage,
}: ConversationsListProps): JSX.Element {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={currentConversationId === conversation.id}
          onSelect={() => onSelectConversation(conversation.id)}
          onRename={() => onRenameConversation({ id: conversation.id, title: conversation.title })}
          onArchive={() => onArchiveConversation(conversation.id)}
          onDelete={() => onDeleteConversation(conversation.id)}
          formatLastMessage={formatLastMessage}
        />
      ))}
    </div>
  );
}

