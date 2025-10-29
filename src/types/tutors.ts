// Types per il sistema Tutor
export interface Tutor {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  system_prompt: string;
  
  // Configurazioni comportamento
  temperature: number;
  max_tokens: number;
  model: string;
  
  // Configurazioni RAG
  use_rag: boolean;
  max_context_chunks: number;
  similarity_threshold: number;
  
  // Configurazioni documenti
  allowed_document_types: string[];
  max_document_size_mb: number;
  
  // Configurazioni visibilità
  visibility: 'private' | 'public' | 'unlisted';
  is_shared: boolean;
  share_token?: string;
  
  // Metadati
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  
  // Statistiche
  total_conversations: number;
  total_messages: number;
  total_tokens_used: number;
  total_documents: number;
}

export interface TutorInsert {
  name: string;
  description?: string;
  avatar_url?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  model?: string;
  use_rag?: boolean;
  max_context_chunks?: number;
  similarity_threshold?: number;
  allowed_document_types?: string[];
  max_document_size_mb?: number;
  visibility?: 'private' | 'public' | 'unlisted';
}

export interface TutorUpdate {
  name?: string;
  description?: string;
  avatar_url?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  model?: string;
  use_rag?: boolean;
  max_context_chunks?: number;
  similarity_threshold?: number;
  allowed_document_types?: string[];
  max_document_size_mb?: number;
  visibility?: 'private' | 'public' | 'unlisted';
  is_shared?: boolean;
}

export interface TutorDocument {
  id: string;
  tutor_id: string;
  document_id: string;
  created_at: string;
}

export interface TutorWithDocuments extends Tutor {
  documents: Array<{
    id: string;
    title: string;
    mime_type: string;
    status: string;
    created_at: string;
  }>;
}

// Configurazioni predefinite per nuovi tutor
export const DEFAULT_TUTOR_CONFIG = {
  system_prompt: "You are a helpful AI tutor. Answer questions based on the provided context and be educational.",
  temperature: 0.7,
  max_tokens: 2000,
  model: "gpt-4o-mini",
  use_rag: true,
  max_context_chunks: 5,
  similarity_threshold: 0.7,
  allowed_document_types: ['pdf', 'txt', 'md', 'doc', 'docx'],
  max_document_size_mb: 10,
  visibility: 'private' as const,
  is_shared: false,
} as const;

// Modelli OpenAI supportati
export const SUPPORTED_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
] as const;

export type SupportedModel = typeof SUPPORTED_MODELS[number];

// Tipi di documento supportati
export const SUPPORTED_DOCUMENT_TYPES = [
  'pdf',
  'txt',
  'md',
  'doc',
  'docx',
] as const;

export type SupportedDocumentType = typeof SUPPORTED_DOCUMENT_TYPES[number];

// Livelli di visibilità
export const VISIBILITY_LEVELS = [
  'private',
  'public',
  'unlisted',
] as const;

export type VisibilityLevel = typeof VISIBILITY_LEVELS[number];
