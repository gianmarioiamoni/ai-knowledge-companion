import type { JSX } from 'react';
import { TutorsEmpty, TutorsGrid, TutorsStats } from "../sections";
import type { Tutor } from "@/types/tutors";

interface TutorsPageContentProps {
  tutors: Tutor[];
  allTutors: Tutor[];
  stats: {
    totalTutors: number;
    publicTutors: number;
    totalConversations: number;
  };
  searchQuery: string;
  onEdit: (tutor: Tutor) => void;
  onDelete: (tutor: Tutor) => void;
  onChat: (tutor: Tutor) => void;
  onDuplicate: (tutor: Tutor) => void;
  onCreateTutor: () => void;
  emptyLabels: {
    noTutors: string;
    noTutorsFound: string;
    createFirstTutor: string;
    tryDifferentSearch: string;
    createFirstTutorButton: string;
  };
  statsLabels: {
    totalTutors: string;
    public: string;
    conversations: string;
  };
}

export function TutorsPageContent({
  tutors,
  /* allTutors */,
  stats,
  searchQuery,
  onEdit,
  onDelete,
  onChat,
  onDuplicate,
  onCreateTutor,
  emptyLabels,
  statsLabels,
}: TutorsPageContentProps): JSX.Element {
  if (tutors.length === 0) {
    return (
      <TutorsEmpty
        isSearching={!!searchQuery}
        searchQuery={searchQuery}
        emptyLabels={emptyLabels}
        onCreateTutor={onCreateTutor}
      />
    );
  }

  return (
    <>
      <TutorsGrid
        tutors={tutors}
        onEdit={onEdit}
        onDelete={onDelete}
        onChat={onChat}
        onDuplicate={onDuplicate}
      />
      
      <TutorsStats
        totalTutors={stats.totalTutors}
        publicTutors={stats.publicTutors}
        totalConversations={stats.totalConversations}
        statsLabels={statsLabels}
      />
    </>
  );
}
