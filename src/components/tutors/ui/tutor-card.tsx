import { Card, CardContent } from "@/components/ui/card";
import { useTutorCard } from "@/hooks/use-tutor-card";
import { TutorCardHeader } from "./tutor-card/tutor-card-header";
import { TutorCardMenu } from "./tutor-card/tutor-card-menu";
import { TutorCardStats } from "./tutor-card/tutor-card-stats";
import { TutorCardActions } from "./tutor-card/tutor-card-actions";
import { TutorCardFooter } from "./tutor-card/tutor-card-footer";
import type { Tutor } from "@/types/tutors";
import type { JSX } from 'react';

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
}: TutorCardProps): JSX.Element {
  const {
    showMenu,
    menuRef,
    initials,
    visibilityIcon,
    visibilityLabel,
    stats,
    lastUsedDate,
    handleMenuToggle,
    handleEdit,
    handleDelete,
    handleChat,
    handleShare,
    handleToggleVisibility,
    handleDuplicate,
  } = useTutorCard({
    tutor,
    onEdit,
    onDelete,
    onChat,
    onShare,
    onToggleVisibility,
    onDuplicate,
  });

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="relative">
        <TutorCardHeader
          name={tutor.name}
          model={tutor.model}
          avatarUrl={tutor.avatar_url}
          initials={initials}
          visibilityIcon={visibilityIcon}
          visibilityLabel={visibilityLabel}
        />
        
        <div className="absolute top-4 right-4">
          <TutorCardMenu
            showMenu={showMenu}
            menuRef={menuRef}
            visibilityIcon={visibilityIcon}
            onMenuToggle={handleMenuToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShare={handleShare}
            onToggleVisibility={handleToggleVisibility}
            onDuplicate={handleDuplicate}
            hasEdit={!!onEdit}
            hasDelete={!!onDelete}
            hasShare={!!onShare}
            hasToggleVisibility={!!onToggleVisibility}
            hasDuplicate={!!onDuplicate}
          />
        </div>
      </div>
      
      <CardContent className="pt-0">
        {tutor.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {tutor.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <TutorCardStats
            conversations={stats.conversations}
            messages={stats.messages}
            documents={stats.documents}
          />
          
          <TutorCardActions
            onChat={handleChat}
            onEdit={handleEdit}
            hasChat={!!onChat}
          />
        </div>
        
        <TutorCardFooter lastUsedDate={lastUsedDate} />
      </CardContent>
    </Card>
  );
}
