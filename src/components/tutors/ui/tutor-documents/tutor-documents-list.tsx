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
    <div className="space-y-2">
      {documents.map((tutorDoc) => {
        // Verifica di sicurezza per evitare errori
        if (!tutorDoc.documents) {
          console.warn('Document data missing for tutor document:', tutorDoc);
          return null;
        }
        
        return (
          <div
            key={tutorDoc.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <TutorDocumentsStatusIcon status={tutorDoc.documents.status} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getDocumentDisplayName(tutorDoc.documents)}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Badge variant="outline">
                    {getDocumentFileType(tutorDoc.documents)}
                  </Badge>
                  <span>{formatFileSize(tutorDoc.documents.file_size || 0)}</span>
                  <span>{getDocumentStatusLabel(tutorDoc.documents.status)}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUnlinkDocument(tutorDoc.document_id)}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
            >
              <Unlink className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
