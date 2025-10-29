'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Link, 
  Unlink, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTutorDocuments } from '@/hooks/use-tutor-documents';
import type { Document } from '@/types/documents';

interface TutorDocumentsSectionProps {
  tutorId: string;
}

export function TutorDocumentsSection({ tutorId }: TutorDocumentsSectionProps) {
  const t = useTranslations('tutors.form.fields');
  const {
    documents,
    availableDocuments,
    loading,
    error,
    linkDocument,
    unlinkDocument
  } = useTutorDocuments(tutorId);

  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');

  const handleLinkDocument = async () => {
    if (!selectedDocumentId) return;
    
    await linkDocument(selectedDocumentId);
    setSelectedDocumentId('');
  };

  const handleUnlinkDocument = async (documentId: string) => {
    await unlinkDocument(documentId);
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDocumentStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Processed';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filtra documenti già collegati
  const linkedDocumentIds = documents.map(doc => doc.document_id);
  const unlinkedDocuments = availableDocuments.filter(doc => 
    !linkedDocumentIds.includes(doc.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{t('documents.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Collegare nuovo documento */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('documents.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {unlinkedDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    <div className="flex items-center space-x-2">
                      {getDocumentStatusIcon(doc.status)}
                      <span>{doc.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {doc.file_type?.toUpperCase()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleLinkDocument}
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

        {/* Documenti collegati */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('documents.linked')} ({documents.length})
          </h4>
          
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              {t('documents.noLinked')}
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((tutorDoc) => (
                <div
                  key={tutorDoc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    {getDocumentStatusIcon(tutorDoc.documents.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tutorDoc.documents.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Badge variant="outline">
                          {tutorDoc.documents.file_type?.toUpperCase()}
                        </Badge>
                        <span>{formatFileSize(tutorDoc.documents.file_size || 0)}</span>
                        <span>{getDocumentStatusLabel(tutorDoc.documents.status)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkDocument(tutorDoc.document_id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
