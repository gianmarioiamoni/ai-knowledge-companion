import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Unlink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TutorDocumentsStatusIcon } from './tutor-documents-status-icon';
import type { DocumentWithStatus } from '@/types/documents';
import type { JSX } from 'react';

interface TutorDocument {
  id: string;
  tutor_id: string;
  document_id: string;
  documents: DocumentWithStatus;
}

interface TutorDocumentsListProps {
  documents: TutorDocument[];
  loading: boolean;
  onUnlinkDocument: (documentId: string) => void;
  formatFileSize: (bytes: number) => string;
  getDocumentStatusLabel: (status?: string) => string;
  getDocumentDisplayName: (doc: DocumentWithStatus) => string;
  getDocumentFileType: (doc: DocumentWithStatus) => string;
}

export function TutorDocumentsList({
  documents,
  loading,
  onUnlinkDocument,
  formatFileSize,
  getDocumentStatusLabel,
  getDocumentDisplayName,
  getDocumentFileType,
}: TutorDocumentsListProps): JSX.Element {
  const t = useTranslations('tutors.form.fields');

  if (documents.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
        {t('documents.noLinked')}
      </p>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {documents.map((tutorDoc) => {
        // Verifica di sicurezza per evitare errori
        if (!tutorDoc.documents) {
          console.warn('Document data missing for tutor document:', tutorDoc);
          return null;
        }
        
        return (
          <div
            key={tutorDoc.id}
            className="flex items-start sm:items-center justify-between gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-md w-full overflow-hidden"
          >
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <TutorDocumentsStatusIcon status={tutorDoc.documents.status} />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getDocumentDisplayName(tutorDoc.documents)}
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {getDocumentFileType(tutorDoc.documents)}
                  </Badge>
                  <span className="whitespace-nowrap">{formatFileSize(tutorDoc.documents.file_size || 0)}</span>
                  <span className="hidden sm:inline whitespace-nowrap">{getDocumentStatusLabel(tutorDoc.documents.status)}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUnlinkDocument(tutorDoc.document_id)}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Unlink className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
