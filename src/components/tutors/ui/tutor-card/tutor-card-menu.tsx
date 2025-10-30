import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Settings,
  Share2,
  Eye,
  EyeOff,
  Trash2,
  Copy
} from "lucide-react";
import type { JSX } from 'react';

interface TutorCardMenuProps {
  showMenu: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  visibilityIcon: string;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  hasEdit: boolean;
  hasDelete: boolean;
  hasShare: boolean;
  hasToggleVisibility: boolean;
  hasDuplicate: boolean;
}

export function TutorCardMenu({
  showMenu,
  menuRef,
  visibilityIcon,
  onMenuToggle,
  onEdit,
  onDelete,
  onShare,
  onToggleVisibility,
  onDuplicate,
  hasEdit,
  hasDelete,
  hasShare,
  hasToggleVisibility,
  hasDuplicate,
}: TutorCardMenuProps): JSX.Element {
  const getVisibilityIconComponent = () => {
    switch (visibilityIcon) {
      case 'eye':
        return <Eye className="h-4 w-4" />;
      case 'share':
        return <Share2 className="h-4 w-4" />;
      default:
        return <EyeOff className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        onClick={onMenuToggle}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
          <div className="py-1">
            {hasEdit && (
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={onEdit}
              >
                <Settings className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            
            {hasDuplicate && (
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={onDuplicate}
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </button>
            )}
            
            {hasShare && (
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            )}
            
            {hasToggleVisibility && (
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={onToggleVisibility}
              >
                {getVisibilityIconComponent()}
                <span>Toggle Visibility</span>
              </button>
            )}
            
            {hasDelete && (
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
