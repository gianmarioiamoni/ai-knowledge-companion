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

      // Carica tutti i documenti dell'utente per la selezione
      const { data: allDocs, error: allDocsError } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'processed')
        .order('created_at', { ascending: false });

      if (allDocsError) throw allDocsError;

      setAvailableDocuments(allDocs || []);

      // Se abbiamo documenti collegati, carica i dettagli
      if (tutorDocs && tutorDocs.length > 0) {
        const documentIds = tutorDocs.map(td => td.document_id);
        const { data: linkedDocs, error: linkedDocsError } = await supabase
          .from('documents')
          .select('*')
          .in('id', documentIds);

        if (linkedDocsError) {
          console.error('Linked documents error:', linkedDocsError);
        } else {
          // Combina i dati
          const combinedDocs = tutorDocs.map(td => ({
            ...td,
            documents: linkedDocs?.find(doc => doc.id === td.document_id) || {
              id: td.document_id,
              name: 'Unknown Document',
              status: 'unknown',
              created_at: new Date().toISOString(),
              file_size: 0,
              file_type: 'unknown'
            }
          }));
          setDocuments(combinedDocs);
        }
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
      const { error } = await supabase
        .from('tutor_documents')
        .insert({
          tutor_id: tutorId,
          document_id: documentId
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('tutor_documents')
        .delete()
        .eq('tutor_id', tutorId)
        .eq('document_id', documentId);

      if (error) throw error;

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
