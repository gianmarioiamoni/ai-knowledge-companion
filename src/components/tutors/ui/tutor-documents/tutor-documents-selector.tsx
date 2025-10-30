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
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Select value={selectedDocumentId} onValueChange={onDocumentSelect}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={t('documents.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {unlinkedDocuments.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                <div className="flex items-center space-x-2">
                  <TutorDocumentsStatusIcon status={(doc as DocumentWithStatus).status} />
                  <span>{doc.title || (doc as DocumentWithStatus).name || 'Unknown Document'}</span>
                  <Badge variant="outline" className="text-xs">
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
        >
          <Link className="h-4 w-4 mr-1" />
          {t('documents.link')}
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
