import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  MessageSquare, 
  FileText, 
  Settings,
  Share2,
  Eye,
  EyeOff,
  Trash2,
  Copy
} from "lucide-react";
import { useTranslations } from 'next-intl';
import type { Tutor } from "@/types/tutors";
import { useState, useEffect, useRef } from 'react';

interface TutorCardProps {
  tutor: Tutor;
  onEdit?: (tutor: Tutor) => void;
  onDelete?: (tutor: Tutor) => void;
  onChat?: (tutor: Tutor) => void;
  onShare?: (tutor: Tutor) => void;
  onToggleVisibility?: (tutor: Tutor) => void;
  onDuplicate?: (tutor: Tutor) => void;
}

export function TutorCard({
  tutor,
  onEdit,
  onDelete,
  onChat,
  onShare,
  onToggleVisibility,
  onDuplicate,
}: TutorCardProps) {
  const t = useTranslations('tutors');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVisibilityIcon = () => {
    switch (tutor.visibility) {
      case 'public':
        return <Eye className="h-4 w-4" />;
      case 'unlisted':
        return <Share2 className="h-4 w-4" />;
      default:
        return <EyeOff className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (tutor.visibility) {
      case 'public':
        return t('card.public');
      case 'unlisted':
        return t('card.unlisted');
      default:
        return t('card.private');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
              <AvatarImage src={tutor.avatar_url} alt={tutor.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {tutor.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {tutor.model}
                </Badge>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  {getVisibilityIcon()}
                  <span className="text-xs">{getVisibilityLabel()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <div className="py-1">
                       {onEdit && (
                         <button
                           className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                           onClick={() => {
                             onEdit(tutor);
                             setShowMenu(false);
                           }}
                         >
                           <Settings className="h-4 w-4" />
                           <span>Edit</span>
                         </button>
                       )}
                       
                       {onDuplicate && (
                         <button
                           className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                           onClick={() => {
                             onDuplicate(tutor);
                             setShowMenu(false);
                           }}
                         >
                           <Copy className="h-4 w-4" />
                           <span>Duplicate</span>
                         </button>
                       )}
                       
                       {onShare && (
                         <button
                           className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                           onClick={() => {
                             onShare(tutor);
                             setShowMenu(false);
                           }}
                         >
                           <Share2 className="h-4 w-4" />
                           <span>Share</span>
                         </button>
                       )}
                       
                       {onToggleVisibility && (
                         <button
                           className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                           onClick={() => {
                             onToggleVisibility(tutor);
                             setShowMenu(false);
                           }}
                         >
                           {getVisibilityIcon()}
                           <span>Toggle Visibility</span>
                         </button>
                       )}
                       
                       {onDelete && (
                         <button
                           className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                           onClick={() => {
                             onDelete(tutor);
                             setShowMenu(false);
                           }}
                         >
                           <Trash2 className="h-4 w-4" />
                           <span>Delete</span>
                         </button>
                       )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {tutor.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {tutor.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                 <div 
                   className="flex items-center space-x-1"
                   title={`${tutor.total_conversations} conversations`}
                 >
                   <MessageSquare className="h-4 w-4" />
                   <span>{tutor.total_conversations}</span>
                 </div>
                 <div 
                   className="flex items-center space-x-1"
                   title={`${tutor.total_messages} messages`}
                 >
                   <FileText className="h-4 w-4" />
                   <span>{tutor.total_messages}</span>
                 </div>
                 <div 
                   className="flex items-center space-x-1"
                   title={`${tutor.total_documents || 0} documents`}
                 >
                   <FileText className="h-4 w-4" />
                   <span>{tutor.total_documents || 0}</span>
                 </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onChat && (
              <Button size="sm" onClick={() => onChat(tutor)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageSquare className="h-4 w-4 mr-1" />
                {t('card.chat')}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit?.(tutor)} 
              className="border-gray-300 dark:border-gray-600"
              title="Edit Tutor"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {tutor.last_used_at && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('card.lastUsed', { date: new Date(tutor.last_used_at).toLocaleDateString() })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
