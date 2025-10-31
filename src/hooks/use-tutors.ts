"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tutor, TutorInsert, TutorUpdate, TutorWithDocuments } from "@/types/tutors";
import * as tutorsService from "@/lib/supabase/tutors";
import { useAuth } from "./use-auth";

export function useTutors() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica tutti i tutor dell'utente
  const loadTutors = useCallback(async () => {
    if (!user) {
      setTutors([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await tutorsService.getTutors();
      
      if (result.error) {
        setError(result.error);
        setTutors([]);
      } else {
        setTutors(result.data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tutors";
      setError(errorMessage);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carica i tutor al mount e quando cambia l'utente
  useEffect(() => {
    loadTutors();
  }, [loadTutors]);

  // Crea un nuovo tutor
  const createTutor = useCallback(async (tutorData: TutorInsert) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    try {
      setError(null);
      
      const result = await tutorsService.createTutor(tutorData);
      
      if (result.error) {
        const errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (result.data) {
        setTutors(prev => [result.data!, ...prev]);
        return { success: true, tutor: result.data };
      }

      return { success: false, error: "No data returned" };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create tutor";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Aggiorna un tutor
  const updateTutor = useCallback(async (tutorId: string, updates: TutorUpdate) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    try {
      setError(null);
      
      const result = await tutorsService.updateTutor(tutorId, updates);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      if (result.data) {
        // Ricarica il tutor completo dal server per avere contatori aggiornati
        console.log('🔄 Refreshing tutor data after update:', tutorId);
        const refreshedResult = await tutorsService.getTutor(tutorId);
        
        if (refreshedResult.error) {
          console.error('⚠️ Failed to refresh tutor, using update result:', refreshedResult.error);
        }
        
        const tutorToUpdate = refreshedResult.data || result.data;
        console.log('✅ Updated tutor data:', {
          id: tutorToUpdate.id,
          name: tutorToUpdate.name,
          total_documents: tutorToUpdate.total_documents,
          total_conversations: tutorToUpdate.total_conversations,
          total_messages: tutorToUpdate.total_messages
        });
        
        setTutors(prev => {
          const updated = prev.map(tutor => 
            tutor.id === tutorId ? tutorToUpdate : tutor
          );
          console.log('📊 Tutors state updated, count:', updated.length);
          return updated;
        });
        
        return { success: true, tutor: tutorToUpdate };
      }

      return { success: false, error: "No data returned" };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update tutor";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Elimina un tutor
  const deleteTutor = useCallback(async (tutorId: string) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    try {
      setError(null);
      
      const result = await tutorsService.deleteTutor(tutorId);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      setTutors(prev => prev.filter(tutor => tutor.id !== tutorId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete tutor";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Collega un documento a un tutor
  const linkDocument = useCallback(async (tutorId: string, documentId: string) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    try {
      setError(null);
      
      const result = await tutorsService.linkDocumentToTutor(tutorId, documentId);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to link document";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Scollega un documento da un tutor
  const unlinkDocument = useCallback(async (tutorId: string, documentId: string) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    try {
      setError(null);
      
      const result = await tutorsService.unlinkDocumentFromTutor(tutorId, documentId);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to unlink document";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Ottieni un tutor specifico
  const getTutor = useCallback(async (tutorId: string) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated", tutor: null };
    }

    try {
      setError(null);
      
      const result = await tutorsService.getTutor(tutorId);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error, tutor: null };
      }

      return { success: true, tutor: result.data || null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get tutor";
      setError(errorMessage);
      return { success: false, error: errorMessage, tutor: null };
    }
  }, [user]);

  // Ottieni tutor con documenti
  const getTutorWithDocuments = useCallback(async (tutorId: string) => {
    if (!user) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated", tutor: null };
    }

    try {
      setError(null);
      
      const result = await tutorsService.getTutorWithDocuments(tutorId);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error, tutor: null };
      }

      return { success: true, tutor: result.data || null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get tutor with documents";
      setError(errorMessage);
      return { success: false, error: errorMessage, tutor: null };
    }
  }, [user]);

  // Ricarica i tutor
  const refreshTutors = useCallback(() => {
    loadTutors();
  }, [loadTutors]);

  return {
    tutors,
    loading,
    error,
    createTutor,
    updateTutor,
    deleteTutor,
    linkDocument,
    unlinkDocument,
    getTutor,
    getTutorWithDocuments,
    refreshTutors,
  };
}
