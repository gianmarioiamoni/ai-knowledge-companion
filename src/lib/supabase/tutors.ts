import { createClient } from '@/lib/supabase/client';
import type { Tutor, TutorInsert, TutorUpdate, TutorWithDocuments } from '@/types/tutors';

// Ottieni un singolo tutor con contatori aggiornati
export async function getTutor(tutorId: string): Promise<{ data?: Tutor; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { data: tutor, error } = await supabase
      .from('tutors')
      .select(`
        *,
        tutor_documents(count)
      `)
      .eq('id', tutorId)
      .eq('owner_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching tutor:', error);
      return { error: error.message };
    }

    if (!tutor) {
      return { error: 'Tutor not found' };
    }

    // Conta le conversazioni per questo tutor
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', tutor.id);

    // Conta i messaggi per questo tutor (tramite le conversazioni)
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('tutor_id', tutor.id);

    let messagesCount = 0;
    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);
      const { count: messagesCountResult } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds);
      messagesCount = messagesCountResult || 0;
    }

    const tutorWithCounts: Tutor = {
      ...tutor,
      total_documents: Array.isArray(tutor.tutor_documents) 
        ? tutor.tutor_documents.length 
        : (tutor.tutor_documents as { count: number })?.count || 0,
      total_conversations: conversationsCount || 0,
      total_messages: messagesCount,
    };

    return { data: tutorWithCounts };
  } catch (error) {
    console.error('Error in getTutor:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Ottieni tutti i tutor dell'utente
export async function getTutors(): Promise<{ data?: Tutor[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('tutors')
      .select(`
        *,
        tutor_documents(count)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutors:', error);
      return { error: error.message };
    }

    // Calcola i conteggi per ogni tutor
    const tutorsWithCounts = await Promise.all((data || []).map(async (tutor) => {
      // Conta le conversazioni per questo tutor
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', tutor.id);

      // Conta i messaggi per questo tutor (tramite le conversazioni)
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('tutor_id', tutor.id);

      let messagesCount = 0;
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        const { count: messagesCountResult } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds);
        messagesCount = messagesCountResult || 0;
      }

      return {
        ...tutor,
        total_documents: tutor.tutor_documents?.[0]?.count || 0,
        total_conversations: conversationsCount || 0,
        total_messages: messagesCount
      };
    }));

    return { data: tutorsWithCounts };
  } catch (error) {
    console.error('Exception fetching tutors:', error);
    return { error: 'Failed to fetch tutors' };
  }
}

// Ottieni tutor con documenti collegati
export async function getTutorWithDocuments(tutorId: string): Promise<{ data?: TutorWithDocuments; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('tutors')
      .select(`
        *,
        tutor_documents!inner(
          document_id,
          documents!inner(
            id,
            title,
            mime_type,
            status,
            created_at
          )
        )
      `)
      .eq('id', tutorId)
      .eq('owner_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching tutor with documents:', error);
      return { error: error.message };
    }

    // Trasforma i dati per il formato TutorWithDocuments
    const tutorWithDocuments: TutorWithDocuments = {
      ...data,
      documents: data.tutor_documents?.map((td: any) => td.documents) || []
    };

    return { data: tutorWithDocuments };
  } catch (error) {
    console.error('Exception fetching tutor with documents:', error);
    return { error: 'Failed to fetch tutor with documents' };
  }
}

// Crea un nuovo tutor
export async function createTutor(tutor: TutorInsert): Promise<{ data?: Tutor; error?: string }> {
  try {
    const response = await fetch('/api/tutors/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tutor),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Create tutor error:", result);
      return { error: result.error || 'Failed to create tutor' };
    }

    return { data: result.tutor };
  } catch (error) {
    console.error("Create tutor exception:", error);
    return { error: "Failed to create tutor" };
  }
}

// Aggiorna un tutor
export async function updateTutor(tutorId: string, updates: TutorUpdate): Promise<{ data?: Tutor; error?: string }> {
  try {
    const response = await fetch(`/api/tutors/${tutorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Update tutor error:", result.error);
      return { error: result.error };
    }

    return { data: result.tutor };
  } catch (error) {
    console.error("Update tutor exception:", error);
    return { error: "Failed to update tutor" };
  }
}

// Elimina un tutor
export async function deleteTutor(tutorId: string): Promise<{ error?: string }> {
  try {
    const response = await fetch(`/api/tutors/${tutorId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Delete tutor error:", result.error);
      return { error: result.error };
    }

    return {};
  } catch (error) {
    console.error("Delete tutor exception:", error);
    return { error: "Failed to delete tutor" };
  }
}

// Collega un documento a un tutor
export async function linkDocumentToTutor(tutorId: string, documentId: string): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/tutors/link-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tutor_id: tutorId, document_id: documentId }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Link document error:", result.error);
      return { error: result.error };
    }

    return {};
  } catch (error) {
    console.error("Link document exception:", error);
    return { error: "Failed to link document" };
  }
}

// Scollega un documento da un tutor
export async function unlinkDocumentFromTutor(tutorId: string, documentId: string): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/tutors/unlink-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tutor_id: tutorId, document_id: documentId }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Unlink document error:", result.error);
      return { error: result.error };
    }

    return {};
  } catch (error) {
    console.error("Unlink document exception:", error);
    return { error: "Failed to unlink document" };
  }
}

// Cerca tutor pubblici
export async function searchPublicTutors(query?: string, limit: number = 20, offset: number = 0): Promise<{ data?: Tutor[]; error?: string }> {
  try {
    const supabase = createClient();
    
    let queryBuilder = supabase
      .from('tutors')
      .select('*')
      .eq('visibility', 'public')
      .eq('is_shared', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching public tutors:', error);
      return { error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.error('Exception searching public tutors:', error);
    return { error: 'Failed to search public tutors' };
  }
}

// Ottieni tutor per share token
export async function getTutorByShareToken(shareToken: string): Promise<{ data?: Tutor; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('share_token', shareToken)
      .eq('visibility', 'unlisted')
      .eq('is_shared', true)
      .single();

    if (error) {
      console.error('Error fetching tutor by share token:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Exception fetching tutor by share token:', error);
    return { error: 'Failed to fetch tutor by share token' };
  }
}
