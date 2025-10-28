'use client'

import { JSX } from 'react'
import { TutorCard } from '../ui/tutor-card'
import type { Tutor } from '@/types/tutors'

interface TutorsGridProps {
  tutors: Tutor[]
  onEdit?: (tutor: Tutor) => void
  onDelete?: (tutor: Tutor) => void
  onChat?: (tutor: Tutor) => void
  onShare?: (tutor: Tutor) => void
  onToggleVisibility?: (tutor: Tutor) => void
}

export function TutorsGrid({
  tutors,
  onEdit,
  onDelete,
  onChat,
  onShare,
  onToggleVisibility
}: TutorsGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutors.map((tutor) => (
        <TutorCard
          key={tutor.id}
          tutor={tutor}
          onEdit={onEdit}
          onDelete={onDelete}
          onChat={onChat}
          onShare={onShare}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  )
}
