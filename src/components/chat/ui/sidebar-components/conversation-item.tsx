'use client';

import { JSX } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Archive, 
  Trash2, 
  MoreHorizontal,
  ArchiveRestore,
  Edit
} from 'lucide-react';
import type { ChatConversation } from '@/types/chat';

interface ConversationItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
  formatLastMessage: (timestamp: string) => string;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onArchive,
  onDelete,
  formatLastMessage,
}: ConversationItemProps): JSX.Element {
  const t = useTranslations('chat');

  // Ensure tutor data exists with proper fallbacks
  const tutor = {
    id: conversation.tutor?.id || 'unknown',
    name: conversation.tutor?.name || 'Unknown Tutor',
    avatar_url: conversation.tutor?.avatar_url || null,
    model: conversation.tutor?.model || 'gpt-4'
  };
  
  const tutorName = tutor.name || 'T';

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-white dark:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={tutor.avatar_url || undefined} alt={tutor.name} />
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
                      onRename();
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('sidebar.menu.rename')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
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
                        onDelete();
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
}

