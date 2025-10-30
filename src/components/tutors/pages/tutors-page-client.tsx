"use client";

import { useState } from "react";
import { useRouter } from '@/i18n/navigation';
import { TutorFormImproved as TutorForm } from "../ui/tutor-form-improved";
import { TutorsHeader, TutorsStats, TutorsEmpty, TutorsGrid } from "../sections";
import { useTutors } from "@/hooks/use-tutors";
import { useTranslations } from 'next-intl';
import type { Tutor, TutorInsert } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorsPageClientProps {
  locale: 'en' | 'it'
}

export function TutorsPageClient({ locale }: TutorsPageClientProps): JSX.Element {
  const t = useTranslations('tutors');
  const router = useRouter();
  const {
    tutors,
    loading,
    error,
    createTutor,
    updateTutor,
    deleteTutor,
  } = useTutors();

  const [showForm, setShowForm] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateTutor = async (data: TutorInsert) => {
    const result = await createTutor(data);
    if (result.success) {
      setShowForm(false);
    }
  };

  const handleUpdateTutor = async (data: TutorInsert) => {
    if (!editingTutor) return;
    
    const result = await updateTutor(editingTutor.id, data);
    if (result.success) {
      setEditingTutor(null);
    }
  };

  const handleDeleteTutor = async (tutor: Tutor) => {
    if (confirm(`Sei sicuro di voler eliminare il tutor "${tutor.name}"?`)) {
      await deleteTutor(tutor.id);
    }
  };

  const handleEditTutor = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setShowForm(true);
  };

  const handleChatTutor = (tutor: Tutor) => {
    router.push(`/chat?tutor=${tutor.id}`);
  };

  const handleDuplicateTutor = async (tutor: Tutor) => {
    const duplicateData: TutorInsert = {
      name: `${tutor.name} (Copy)`,
      description: tutor.description,
      avatar_url: tutor.avatar_url,
      system_prompt: tutor.system_prompt,
      temperature: tutor.temperature,
      max_tokens: tutor.max_tokens,
      model: tutor.model,
      use_rag: tutor.use_rag,
      max_context_chunks: tutor.max_context_chunks,
      similarity_threshold: tutor.similarity_threshold,
      allowed_document_types: tutor.allowed_document_types,
      max_document_size_mb: tutor.max_document_size_mb,
      visibility: tutor.visibility,
    };
    
    const result = await createTutor(duplicateData);
    if (result.success) {
      // Il tutor duplicato verrà mostrato automaticamente nella lista
    }
  };

  const filteredTutors = tutors.filter(tutor =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tutor.description && tutor.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tutors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error loading tutors
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <TutorsHeader
            title={t('title')}
            subtitle={t('subtitle')}
            searchPlaceholder={t('searchPlaceholder')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewTutor={() => setShowForm(true)}
            onFilters={() => {/* TODO: Implement filters */}}
          />

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
                <TutorForm
                  tutor={editingTutor || undefined}
                  onSubmit={editingTutor ? handleUpdateTutor : handleCreateTutor}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingTutor(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          {filteredTutors.length === 0 ? (
            <TutorsEmpty
              isSearching={!!searchQuery}
              searchQuery={searchQuery}
              emptyLabels={{
                noTutors: t('noTutors'),
                noTutorsFound: t('noTutorsFound'),
                createFirstTutor: t('createFirstTutor'),
                tryDifferentSearch: t('tryDifferentSearch'),
                createFirstTutorButton: t('createFirstTutorButton'),
              }}
              onCreateTutor={() => setShowForm(true)}
            />
          ) : (
            <>
              <TutorsGrid
                tutors={filteredTutors}
                onEdit={handleEditTutor}
                onDelete={handleDeleteTutor}
                onChat={handleChatTutor}
                onDuplicate={handleDuplicateTutor}
              />
              
              {/* Stats */}
              <TutorsStats
                totalTutors={tutors.length}
                publicTutors={tutors.filter(t => t.visibility === 'public').length}
                totalConversations={tutors.reduce((sum, t) => sum + t.total_conversations, 0)}
                statsLabels={{
                  totalTutors: t('stats.totalTutors'),
                  public: t('stats.public'),
                  conversations: t('stats.conversations'),
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
