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
  EyeOff
} from "lucide-react";
import { useTranslations } from 'next-intl';
import type { Tutor } from "@/types/tutors";

interface TutorCardProps {
  tutor: Tutor;
  onEdit?: (tutor: Tutor) => void;
  onDelete?: (tutor: Tutor) => void;
  onChat?: (tutor: Tutor) => void;
  onShare?: (tutor: Tutor) => void;
  onToggleVisibility?: (tutor: Tutor) => void;
}

export function TutorCard({
  tutor,
  onEdit,
  onDelete,
  onChat,
  onShare,
  onToggleVisibility,
}: TutorCardProps) {
  const t = useTranslations('tutors');
  
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tutor.avatar_url} alt={tutor.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {tutor.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {tutor.model}
                </Badge>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  {getVisibilityIcon()}
                  <span className="text-xs">{getVisibilityLabel()}</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {tutor.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {tutor.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{tutor.total_conversations}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{tutor.total_messages}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {onChat && (
              <Button size="sm" onClick={() => onChat(tutor)}>
                <MessageSquare className="h-4 w-4 mr-1" />
                {t('card.chat')}
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(tutor)}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {tutor.last_used_at && (
          <div className="mt-2 text-xs text-muted-foreground">
            {t('card.lastUsed', { date: new Date(tutor.last_used_at).toLocaleDateString() })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
