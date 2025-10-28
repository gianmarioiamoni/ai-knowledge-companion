import { z } from 'zod';
import { SUPPORTED_MODELS, SUPPORTED_DOCUMENT_TYPES, VISIBILITY_LEVELS } from '@/types/tutors';

// Schema per creazione tutor
export const createTutorSchema = z.object({
  name: z.string()
    .min(1, 'Nome è richiesto')
    .max(255, 'Nome troppo lungo'),
  
  description: z.string()
    .max(1000, 'Descrizione troppo lunga')
    .optional(),
  
  avatar_url: z.string().optional(),
  
  system_prompt: z.string()
    .min(10, 'Prompt di sistema troppo corto')
    .max(4000, 'Prompt di sistema troppo lungo')
    .default('You are a helpful AI tutor. Answer questions based on the provided context and be educational.'),
  
  // Configurazioni comportamento
  temperature: z.number()
    .min(0, 'Temperature deve essere >= 0')
    .max(2, 'Temperature deve essere <= 2')
    .default(0.7),
  
  max_tokens: z.number()
    .int('Max tokens deve essere un numero intero')
    .min(1, 'Max tokens deve essere > 0')
    .max(4000, 'Max tokens troppo alto')
    .default(2000),
  
  model: z.enum(SUPPORTED_MODELS)
    .default('gpt-4o-mini'),
  
  // Configurazioni RAG
  use_rag: z.boolean().default(true),
  
  max_context_chunks: z.number()
    .int('Max context chunks deve essere un numero intero')
    .min(1, 'Max context chunks deve essere > 0')
    .max(20, 'Max context chunks troppo alto')
    .default(5),
  
  similarity_threshold: z.number()
    .min(0, 'Similarity threshold deve essere >= 0')
    .max(1, 'Similarity threshold deve essere <= 1')
    .default(0.7),
  
  // Configurazioni documenti
  allowed_document_types: z.array(z.enum(SUPPORTED_DOCUMENT_TYPES))
    .min(1, 'Almeno un tipo di documento deve essere consentito')
    .default(['pdf', 'txt', 'md', 'doc', 'docx']),
  
  max_document_size_mb: z.number()
    .int('Max document size deve essere un numero intero')
    .min(1, 'Max document size deve essere > 0')
    .max(100, 'Max document size troppo alto')
    .default(10),
  
  // Configurazioni visibilità
  visibility: z.enum(VISIBILITY_LEVELS)
    .default('private'),
});

// Schema per aggiornamento tutor
export const updateTutorSchema = createTutorSchema.partial().extend({
  is_shared: z.boolean().optional(),
});

// Schema per condivisione tutor
export const shareTutorSchema = z.object({
  visibility: z.enum(['public', 'unlisted']),
  is_shared: z.boolean(),
});

// Schema per collegamento documento-tutor
export const linkDocumentSchema = z.object({
  tutor_id: z.string().uuid('ID tutor non valido'),
  document_id: z.string().uuid('ID documento non valido'),
});

// Schema per ricerca tutor
export const searchTutorsSchema = z.object({
  query: z.string().optional(),
  visibility: z.enum(VISIBILITY_LEVELS).optional(),
  model: z.enum(SUPPORTED_MODELS).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// Schema per configurazioni tutor
export const tutorConfigSchema = z.object({
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().int().min(1).max(4000),
  model: z.enum(SUPPORTED_MODELS),
  use_rag: z.boolean(),
  max_context_chunks: z.number().int().min(1).max(20),
  similarity_threshold: z.number().min(0).max(1),
});

// Tipi inferiti dagli schema
export type CreateTutorInput = z.infer<typeof createTutorSchema>;
export type UpdateTutorInput = z.infer<typeof updateTutorSchema>;
export type ShareTutorInput = z.infer<typeof shareTutorSchema>;
export type LinkDocumentInput = z.infer<typeof linkDocumentSchema>;
export type SearchTutorsInput = z.infer<typeof searchTutorsSchema>;
export type TutorConfigInput = z.infer<typeof tutorConfigSchema>;
