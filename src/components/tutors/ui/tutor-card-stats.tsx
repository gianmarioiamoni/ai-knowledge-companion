import { MessageSquare, MessageCircle, FileText } from "lucide-react";
import type { JSX } from 'react';

interface TutorCardStatsProps {
  conversations: number;
  messages: number;
  documents: number;
}

export function TutorCardStats({
  conversations,
  messages,
  documents,
}: TutorCardStatsProps): JSX.Element {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
      <div 
        className="flex items-center space-x-1"
        title={`${conversations} conversations`}
      >
        <MessageSquare className="h-4 w-4" />
        <span>{conversations}</span>
      </div>
      <div 
        className="flex items-center space-x-1"
        title={`${messages} messages`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{messages}</span>
      </div>
      <div 
        className="flex items-center space-x-1"
        title={`${documents} documents`}
      >
        <FileText className="h-4 w-4" />
        <span>{documents}</span>
      </div>
    </div>
  );
}
