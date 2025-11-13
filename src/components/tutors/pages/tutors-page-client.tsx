"use client";

import { TutorsHeader } from "../sections";
import { 
  TutorsLoading, 
  TutorsError, 
  TutorsFormModal, 
  TutorsPageContent 
} from "../ui";
import { useTutorsPage } from "@/hooks/use-tutors-page";
import { useTranslations } from 'next-intl';
import type { JSX } from 'react';

interface TutorsPageClientProps {
  locale: 'en' | 'it'
}

export function TutorsPageClient(): JSX.Element {
  const t = useTranslations('tutors');
  const {
    tutors,
    stats,
    loading,
    error,
    showForm,
    editingTutor,
    setSearchQuery,
    handleCreateTutor,
    handleUpdateTutor,
    handleDeleteTutor,
    handleEditTutor,
    handleChatTutor,
    handleDuplicateTutor,
    handleNewTutor,
    handleCloseForm,
    handleFilters,
  } = useTutorsPage();

  // Early returns for loading and error states
  if (loading) {
    return <TutorsLoading />;
  }

  if (error) {
    return <TutorsError error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <TutorsHeader
            title={t('title')}
            subtitle={t('subtitle')}
            searchPlaceholder={t('searchPlaceholder')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewTutor={handleNewTutor}
            onFilters={handleFilters}
          />

          {/* Form Modal */}
          <TutorsFormModal
            show={showForm}
            tutor={editingTutor ?? undefined}
            onSubmit={editingTutor ? handleUpdateTutor : handleCreateTutor}
            onCancel={handleCloseForm}
          />

          {/* Content */}
          <TutorsPageContent
            tutors={tutors}
            allTutors={allTutors}
            stats={stats}
            searchQuery={searchQuery}
            onEdit={handleEditTutor}
            onDelete={handleDeleteTutor}
            onChat={handleChatTutor}
            onDuplicate={handleDuplicateTutor}
            onCreateTutor={handleNewTutor}
            emptyLabels={{
              noTutors: t('noTutors'),
              noTutorsFound: t('noTutorsFound'),
              createFirstTutor: t('createFirstTutor'),
              tryDifferentSearch: t('tryDifferentSearch'),
              createFirstTutorButton: t('createFirstTutorButton'),
            }}
            statsLabels={{
              totalTutors: t('stats.totalTutors'),
              public: t('stats.public'),
              conversations: t('stats.conversations'),
            }}
          />
        </div>
      </div>
    </div>
  );
}
