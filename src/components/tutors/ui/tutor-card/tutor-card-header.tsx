import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Share2, EyeOff, Store } from "lucide-react";
import { TutorCardAvatar } from "./tutor-card-avatar";
import type { JSX } from 'react';

interface TutorCardHeaderProps {
  name: string;
  model: string;
  avatarUrl?: string;
  initials: string;
  visibilityIcon: string;
  visibilityLabel: string;
}

export function TutorCardHeader({
  name,
  model,
  avatarUrl,
  initials,
  visibilityIcon,
  visibilityLabel,
}: TutorCardHeaderProps): JSX.Element {
  const getVisibilityIconComponent = () => {
    switch (visibilityIcon) {
      case 'eye':
        return <Eye className="h-4 w-4" />;
      case 'share':
        return <Share2 className="h-4 w-4" />;
      case 'store':
        return <Store className="h-4 w-4" />;
      default:
        return <EyeOff className="h-4 w-4" />;
    }
  };

  return (
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <TutorCardAvatar
            name={name}
            avatarUrl={avatarUrl}
            initials={initials}
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {name}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {model}
              </Badge>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                {getVisibilityIconComponent()}
                <span className="text-xs">{visibilityLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
