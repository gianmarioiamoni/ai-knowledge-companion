import { useState } from 'react';
import { useTutorDocuments } from '@/hooks/use-tutor-documents';
import type { Document, DocumentWithStatus } from '@/types/documents';

interface UseTutorDocumentsSectionProps {
  tutorId: string;
}

export function useTutorDocumentsSection({ tutorId }: UseTutorDocumentsSectionProps) {
  const {
    documents,
    availableDocuments,
    loading,
    error,
    linkDocument,
    unlinkDocument
  } = useTutorDocuments(tutorId);

  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');

  // Event handlers
  const handleLinkDocument = async () => {
    if (!selectedDocumentId) return;
    
    await linkDocument(selectedDocumentId);
    setSelectedDocumentId('');
  };

  const handleUnlinkDocument = async (documentId: string) => {
    await unlinkDocument(documentId);
  };

  // Utility functions
  const getDocumentStatusIcon = (status?: string) => {
    switch (status) {
      case 'processed':
        return 'check-circle';
      case 'processing':
        return 'loader';
      case 'error':
        return 'alert-circle';
      default:
        return 'file-text';
    }
  };

  const getDocumentStatusLabel = (status?: string) => {
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

  const getDocumentDisplayName = (doc: Document | DocumentWithStatus) => {
    return doc.title || (doc as DocumentWithStatus).name || 'Unknown Document';
  };

  const getDocumentFileType = (doc: Document | DocumentWithStatus) => {
    return (doc as DocumentWithStatus).file_type?.toUpperCase() || 
           doc.mime_type?.split('/')[1]?.toUpperCase();
  };

  // Computed values
  const linkedDocumentIds = documents.map(doc => doc.document_id);
  const unlinkedDocuments = availableDocuments.filter(doc => 
    !linkedDocumentIds.includes(doc.id)
  );

  return {
    // Data
    documents,
    availableDocuments,
    unlinkedDocuments,
    loading,
    error,
    
    // UI State
    selectedDocumentId,
    
    // Actions
    setSelectedDocumentId,
    handleLinkDocument,
    handleUnlinkDocument,
    
    // Utility functions
    getDocumentStatusIcon,
    getDocumentStatusLabel,
    formatFileSize,
    getDocumentDisplayName,
    getDocumentFileType,
  };
}
