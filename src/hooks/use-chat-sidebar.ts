'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ChatConversation } from '@/types/chat';

interface UseChatSidebarProps {
  conversations: ChatConversation[];
}

interface UseChatSidebarReturn {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: ChatConversation[];
  
  // Rename dialog state
  renameDialogOpen: boolean;
  renamingConversation: { id: string; title: string } | null;
  newTitle: string;
  setNewTitle: (title: string) => void;
  
  // Rename handlers
  handleOpenRenameDialog: (conversation: { id: string; title: string }) => void;
  handleCloseRenameDialog: () => void;
  handleSaveRename: (onRename: (id: string, title: string) => void) => void;
  
  // Utility
  formatLastMessage: (timestamp: string) => string;
}

export function useChatSidebar({ conversations }: UseChatSidebarProps): UseChatSidebarReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingConversation, setRenamingConversation] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Filter and deduplicate conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // Deduplicate by ID (in case of state inconsistencies)
      .filter((conv, index, self) => 
        index === self.findIndex(c => c.id === conv.id)
      );
  }, [conversations, searchQuery]);

  // Rename dialog handlers
  const handleOpenRenameDialog = useCallback((conversation: { id: string; title: string }) => {
    setRenamingConversation(conversation);
    setNewTitle(conversation.title);
    setRenameDialogOpen(true);
  }, []);

  const handleCloseRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
    setRenamingConversation(null);
    setNewTitle('');
  }, []);

  const handleSaveRename = useCallback((onRename: (id: string, title: string) => void) => {
    if (renamingConversation && newTitle.trim()) {
      onRename(renamingConversation.id, newTitle.trim());
      handleCloseRenameDialog();
    }
  }, [renamingConversation, newTitle, handleCloseRenameDialog]);

  // Format last message timestamp
  const formatLastMessage = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredConversations,
    renameDialogOpen,
    renamingConversation,
    newTitle,
    setNewTitle,
    handleOpenRenameDialog,
    handleCloseRenameDialog,
    handleSaveRename,
    formatLastMessage,
  };
}

