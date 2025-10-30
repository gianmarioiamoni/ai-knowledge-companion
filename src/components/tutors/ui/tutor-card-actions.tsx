import { Button } from "@/components/ui/button";
import { MessageSquare, Settings } from "lucide-react";
import { useTranslations } from 'next-intl';
import type { JSX } from 'react';

interface TutorCardActionsProps {
  onChat: () => void;
  onEdit: () => void;
  hasChat: boolean;
}

export function TutorCardActions({
  onChat,
  onEdit,
  hasChat,
}: TutorCardActionsProps): JSX.Element {
  const t = useTranslations('tutors');

  return (
    <div className="flex items-center space-x-2">
      {hasChat && (
        <Button size="sm" onClick={onChat} className="bg-blue-600 hover:bg-blue-700 text-white">
          <MessageSquare className="h-4 w-4 mr-1" />
          {t('card.chat')}
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onEdit} 
        className="border-gray-300 dark:border-gray-600"
        title="Edit Tutor"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
