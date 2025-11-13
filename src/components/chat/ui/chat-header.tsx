'use client';

import { JSX } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, X, Trash2, Archive } from 'lucide-react';

interface ChatHeaderProps {
  onClose?: () => void;
  onDeleteAllConversations?: () => void;
  onArchiveAllConversations?: () => void;
}

export function ChatHeader({ 
  onClose, 
  onDeleteAllConversations,
  onArchiveAllConversations 
}: ChatHeaderProps): JSX.Element {
  const t = useTranslations('chat');

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt="Tutor" />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            AI
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Tutor
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('header.online')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {onArchiveAllConversations && (
              <>
                <DropdownMenuItem
                  onClick={onArchiveAllConversations}
                  className="cursor-pointer"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {t('header.menu.archiveAll')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {onDeleteAllConversations && (
              <DropdownMenuItem
                onClick={() => {
                  if (confirm(t('header.menu.deleteAllConfirm'))) {
                    onDeleteAllConversations();
                  }
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('header.menu.deleteAll')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
