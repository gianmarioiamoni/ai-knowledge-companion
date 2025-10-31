import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TutorDocumentsStatusIcon } from './tutor-documents-status-icon';
import type { Document, DocumentWithStatus } from '@/types/documents';
import type { JSX } from 'react';

interface TutorDocumentsSelectorProps {
  selectedDocumentId: string;
  unlinkedDocuments: Document[];
  loading: boolean;
  onDocumentSelect: (documentId: string) => void;
  onLinkDocument: () => void;
}

export function TutorDocumentsSelector({
  selectedDocumentId,
  unlinkedDocuments,
  loading,
  onDocumentSelect,
  onLinkDocument,
}: TutorDocumentsSelectorProps): JSX.Element {
  const t = useTranslations('tutors.form.fields');

  return (
    <div className="space-y-2 sm:space-y-3 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
        <Select value={selectedDocumentId} onValueChange={onDocumentSelect}>
          <SelectTrigger className="flex-1 w-full text-xs sm:text-sm">
            <SelectValue placeholder={t('documents.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent className="max-w-[calc(100vw-4rem)] sm:max-w-none">
            {unlinkedDocuments.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                <div className="flex items-center gap-1 sm:gap-2 max-w-full">
                  <TutorDocumentsStatusIcon status={(doc as DocumentWithStatus).status} />
                  <span className="truncate text-xs sm:text-sm">{doc.title || (doc as DocumentWithStatus).name || 'Unknown Document'}</span>
                  <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                    {doc.mime_type?.split('/')[1]?.toUpperCase() || (doc as DocumentWithStatus).file_type?.toUpperCase()}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={onLinkDocument}
          disabled={!selectedDocumentId || loading}
          size="sm"
          className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm"
        >
          <Link className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{t('documents.link')}</span>
        </Button>
      </div>
      
      {unlinkedDocuments.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('documents.noAvailable')}
        </p>
      )}
    </div>
  );
}
