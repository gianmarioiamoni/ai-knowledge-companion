import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Document } from '@/types/documents';

interface TutorDocument {
  id: string;
  tutor_id: string;
  document_id: string;
  documents: Document;
}

export function useTutorDocuments(tutorId: string | null) {
  const [documents, setDocuments] = useState<TutorDocument[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Carica documenti collegati al tutor
  const loadTutorDocuments = async () => {
    if (!tutorId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Carica documenti collegati al tutor
      const { data: tutorDocs, error: tutorDocsError } = await supabase
        .from('tutor_documents')
        .select('id, tutor_id, document_id')
        .eq('tutor_id', tutorId);

      if (tutorDocsError) {
        console.error('Tutor documents error:', tutorDocsError);
        // Se la tabella non esiste, inizializza con array vuoto
        if (tutorDocsError.code === 'PGRST116') {
          setDocuments([]);
        } else {
          throw tutorDocsError;
        }
      } else {
        setDocuments(tutorDocs || []);
      }

      // Assicurati che documents sia sempre un array
      if (!tutorDocs || tutorDocs.length === 0) {
        setDocuments([]);
      }

      // Carica tutti i documenti dell'utente tramite API
      const response = await fetch('/api/documents?status=all');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const { documents: allDocs } = await response.json();
      setAvailableDocuments(allDocs || []);

      // Se abbiamo documenti collegati, carica i dettagli
      if (tutorDocs && tutorDocs.length > 0) {
        const documentIds = tutorDocs.map(td => td.document_id);
        const linkedDocs = allDocs?.filter(doc => documentIds.includes(doc.id)) || [];
        
        // Combina i dati
        const combinedDocs = tutorDocs.map(td => {
          const docData = linkedDocs.find(doc => doc.id === td.document_id);
          return {
            ...td,
            documents: docData || {
              id: td.document_id,
              title: 'Unknown Document',
              name: 'Unknown Document',
              status: 'unknown',
              created_at: new Date().toISOString(),
              file_size: 0,
              file_type: 'unknown',
              mime_type: 'unknown'
            }
          };
        });
        setDocuments(combinedDocs);
      } else {
        // Se non ci sono documenti collegati, assicurati che documents sia un array vuoto
        setDocuments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Collega un documento al tutor
  const linkDocument = async (documentId: string) => {
    if (!tutorId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tutors/link-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutor_id: tutorId,
          document_id: documentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link document');
      }

      // Ricarica i documenti
      await loadTutorDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link document');
    } finally {
      setLoading(false);
    }
  };

  // Scollega un documento dal tutor
  const unlinkDocument = async (documentId: string) => {
    if (!tutorId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tutors/unlink-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutor_id: tutorId,
          document_id: documentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlink document');
      }

      // Ricarica i documenti
      await loadTutorDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorDocuments();
  }, [tutorId]);

  return {
    documents,
    availableDocuments,
    loading,
    error,
    linkDocument,
    unlinkDocument,
    refresh: loadTutorDocuments
  };
}
