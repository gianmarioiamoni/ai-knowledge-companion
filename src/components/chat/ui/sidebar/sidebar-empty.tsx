'use client';

import { JSX } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';

interface SidebarEmptyProps {
  searchQuery: string;
}

export function SidebarEmpty({ searchQuery }: SidebarEmptyProps): JSX.Element {
  const t = useTranslations('chat');

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {searchQuery ? t('sidebar.noResults') : t('sidebar.empty.title')}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {searchQuery ? t('sidebar.noResultsDesc') : t('sidebar.empty.subtitle')}
      </p>
    </div>
  );
}

