'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTutorDocumentsSection } from '@/hooks/use-tutor-documents-section';
import { TutorDocumentsError } from './tutor-documents/tutor-documents-error';
import { TutorDocumentsSelector } from './tutor-documents/tutor-documents-selector';
import { TutorDocumentsList } from './tutor-documents/tutor-documents-list';
import type { JSX } from 'react';

interface TutorDocumentsSectionProps {
  tutorId: string;
}

export function TutorDocumentsSection({ tutorId }: TutorDocumentsSectionProps): JSX.Element {
  const t = useTranslations('tutors.form.fields');
  const {
    documents,
    unlinkedDocuments,
    loading,
    error,
    selectedDocumentId,
    setSelectedDocumentId,
    handleLinkDocument,
    handleUnlinkDocument,
    formatFileSize,
    getDocumentStatusLabel,
    getDocumentDisplayName,
    getDocumentFileType,
  } = useTutorDocumentsSection({ tutorId });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">{t('documents.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
        {error && <TutorDocumentsError error={error} />}

        {/* Collegare nuovo documento */}
        <TutorDocumentsSelector
          selectedDocumentId={selectedDocumentId}
          unlinkedDocuments={unlinkedDocuments}
          loading={loading}
          onDocumentSelect={setSelectedDocumentId}
          onLinkDocument={handleLinkDocument}
        />

        {/* Documenti collegati */}
        <div className="space-y-2 w-full">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('documents.linked')} ({documents.length})
          </h4>
          
          <TutorDocumentsList
            documents={documents}
            loading={loading}
            onUnlinkDocument={handleUnlinkDocument}
            formatFileSize={formatFileSize}
            getDocumentStatusLabel={getDocumentStatusLabel}
            getDocumentDisplayName={getDocumentDisplayName}
            getDocumentFileType={getDocumentFileType}
          />
        </div>
      </CardContent>
    </Card>
  );
}
