'use client';

import { JSX } from 'react';
import { useChatSidebar } from '@/hooks/use-chat-sidebar';
import { SidebarHeader } from './chat-sidebar/sidebar-header';
import { SidebarEmpty } from './chat-sidebar/sidebar-empty';
import { ConversationsList } from './chat-sidebar/conversations-list';
import { RenameDialog } from './chat-sidebar/rename-dialog';
import type { ConversationListProps } from '@/types/chat';

/**
 * ChatSidebar - Orchestrator component for the chat sidebar
 * Delegates logic to useChatSidebar hook and rendering to specialized components
 */
export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onArchiveConversation,
}: ConversationListProps): JSX.Element {
  const {
    searchQuery,
    setSearchQuery,
    filteredConversations,
    renameDialogOpen,
    newTitle,
    setNewTitle,
    handleOpenRenameDialog,
    handleCloseRenameDialog,
    handleSaveRename,
    formatLastMessage,
  } = useChatSidebar({ conversations });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <SidebarHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <SidebarEmpty searchQuery={searchQuery} />
        ) : (
          <ConversationsList
            conversations={filteredConversations}
            currentConversationId={currentConversationId}
            onSelectConversation={onSelectConversation}
            onRenameConversation={handleOpenRenameDialog}
            onDeleteConversation={onDeleteConversation}
            onArchiveConversation={onArchiveConversation}
            formatLastMessage={formatLastMessage}
          />
        )}
      </div>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={handleCloseRenameDialog}
        newTitle={newTitle}
        onNewTitleChange={setNewTitle}
        onSave={() => handleSaveRename(onRenameConversation)}
        onCancel={handleCloseRenameDialog}
      />
    </div>
  );
}
