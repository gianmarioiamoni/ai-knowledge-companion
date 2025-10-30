import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { JSX } from 'react';

interface TutorCardAvatarProps {
  name: string;
  avatarUrl?: string;
  initials: string;
}

export function TutorCardAvatar({ 
  name, 
  avatarUrl, 
  initials 
}: TutorCardAvatarProps): JSX.Element {
  return (
    <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
