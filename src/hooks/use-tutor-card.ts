import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Tutor } from "@/types/tutors";

interface UseTutorCardProps {
  tutor: Tutor;
  onEdit?: (tutor: Tutor) => void;
  onDelete?: (tutor: Tutor) => void;
  onChat?: (tutor: Tutor) => void;
  onShare?: (tutor: Tutor) => void;
  onToggleVisibility?: (tutor: Tutor) => void;
  onDuplicate?: (tutor: Tutor) => void;
}

export function useTutorCard({
  tutor,
  onEdit,
  onDelete,
  onChat,
  onShare,
  onToggleVisibility,
  onDuplicate,
}: UseTutorCardProps) {
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

  // Utility functions
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
        return 'eye';
      case 'unlisted':
        return 'share';
      case 'marketplace':
        return 'store';
      default:
        return 'eye-off';
    }
  };

  const getVisibilityLabel = () => {
    switch (tutor.visibility) {
      case 'public':
        return t('card.public');
      case 'unlisted':
        return t('card.unlisted');
      case 'marketplace':
        return t('card.marketplace');
      default:
        return t('card.private');
    }
  };

  // Event handlers
  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      handleMenuAction(() => onEdit(tutor));
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      handleMenuAction(() => onDelete(tutor));
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat(tutor);
    }
  };

  const handleShare = () => {
    if (onShare) {
      handleMenuAction(() => onShare(tutor));
    }
  };

  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      handleMenuAction(() => onToggleVisibility(tutor));
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      handleMenuAction(() => onDuplicate(tutor));
    }
  };

  // Computed values
  const stats = {
    conversations: tutor.total_conversations,
    messages: tutor.total_messages,
    documents: tutor.total_documents || 0,
  };

  const lastUsedDate = tutor.last_used_at 
    ? new Date(tutor.last_used_at).toLocaleDateString()
    : null;

  return {
    // State
    showMenu,
    menuRef,
    
    // Computed values
    initials: getInitials(tutor.name),
    visibilityIcon: getVisibilityIcon(),
    visibilityLabel: getVisibilityLabel(),
    stats,
    lastUsedDate,
    
    // Event handlers
    handleMenuToggle,
    handleEdit,
    handleDelete,
    handleChat,
    handleShare,
    handleToggleVisibility,
    handleDuplicate,
  };
}
