'use client';

import { JSX, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MessageSquare, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  Search,
  ArchiveRestore
} from 'lucide-react';
import type { ConversationListProps } from '@/types/chat';

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
}: ConversationListProps): JSX.Element {
  const t = useTranslations('chat');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations
    .filter(conv =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Deduplicate by ID (in case of state inconsistencies)
    .filter((conv, index, self) => 
      index === self.findIndex(c => c.id === conv.id)
    );

  const formatLastMessage = (timestamp: string) => {
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
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('sidebar.title')}
          </h2>
          <Button size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('sidebar.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? t('sidebar.noResults') : t('sidebar.empty.title')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchQuery ? t('sidebar.noResultsDesc') : t('sidebar.empty.subtitle')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              // Ensure tutor data exists with proper fallbacks
              const tutor = {
                id: conversation.tutor?.id || 'unknown',
                name: conversation.tutor?.name || 'Unknown Tutor',
                avatar_url: conversation.tutor?.avatar_url || null,
                model: conversation.tutor?.model || 'gpt-4'
              };
              
              // Additional safety check
              const tutorName = tutor.name || 'T';
              
              return (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={tutor.avatar_url} alt={tutor.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {(() => {
                          try {
                            return (tutorName || 'T').charAt(0).toUpperCase();
                          } catch (error) {
                            console.error('Error getting tutor initial:', error, { tutorName, tutor });
                            return 'T';
                          }
                        })()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {formatLastMessage(conversation.last_message_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {tutor.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {tutor.model}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {conversation.message_count} messages
                          </span>
                          {conversation.is_archived && (
                            <Badge variant="secondary" className="text-xs">
                              <Archive className="h-3 w-3 mr-1" />
                              Archived
                            </Badge>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onArchiveConversation(conversation.id);
                              }}
                              className="cursor-pointer"
                            >
                              {conversation.is_archived ? (
                                <>
                                  <ArchiveRestore className="h-4 w-4 mr-2" />
                                  {t('sidebar.menu.unarchive')}
                                </>
                              ) : (
                                <>
                                  <Archive className="h-4 w-4 mr-2" />
                                  {t('sidebar.menu.archive')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(t('sidebar.menu.deleteConfirm'))) {
                                  onDeleteConversation(conversation.id);
                                }
                              }}
                              className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('sidebar.menu.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
