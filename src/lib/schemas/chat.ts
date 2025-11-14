import { z } from 'zod';
import { MESSAGE_ROLES } from '@/types/chat';

// Schema for creating a new conversation
export const createConversationSchema = z.object({
  tutor_id: z.string().uuid('Invalid tutor ID'),
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema for creating a new message
export const createMessageSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
  role: z.enum(MESSAGE_ROLES, {
    message: 'Invalid message role'
  }),
  content: z.string()
    .min(1, 'Message content is required')
    .max(10000, 'Message too long'),
  tokens_used: z.number()
    .int('Tokens used must be an integer')
    .min(0, 'Tokens used must be >= 0')
    .optional(),
  model: z.string()
    .min(1, 'Model name is required')
    .max(100, 'Model name too long')
    .optional(),
  temperature: z.number()
    .min(0, 'Temperature must be >= 0')
    .max(2, 'Temperature must be <= 2')
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema for updating a conversation
export const updateConversationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .optional(),
  is_archived: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema for chat request (user message)
export const chatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(5000, 'Message too long'),
  conversation_id: z.string().uuid('Invalid conversation ID'),
  tutor_id: z.string().uuid('Invalid tutor ID'),
});

// Schema for RAG context
export const ragContextSchema = z.object({
  message_id: z.string().uuid('Invalid message ID'),
  chunk_id: z.string().uuid('Invalid chunk ID'),
  similarity_score: z.number()
    .min(0, 'Similarity score must be >= 0')
    .max(1, 'Similarity score must be <= 1'),
});

// Schema for conversation query parameters
export const conversationQuerySchema = z.object({
  tutor_id: z.string().uuid('Invalid tutor ID').optional(),
  archived: z.boolean().optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be >= 1')
    .max(100, 'Limit must be <= 100')
    .default(20),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be >= 0')
    .default(0),
});

// Schema for message query parameters
export const messageQuerySchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be >= 1')
    .max(200, 'Limit must be <= 200')
    .default(50),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be >= 0')
    .default(0),
});

// Schema for chat response validation
export const chatResponseSchema = z.object({
  success: z.boolean(),
  message: z.object({
    id: z.string().uuid(),
    conversation_id: z.string().uuid(),
    role: z.enum(MESSAGE_ROLES),
    content: z.string(),
    tokens_used: z.number().int().min(0),
    model: z.string().optional(),
    temperature: z.number().optional(),
    created_at: z.string(),
    rag_chunks: z.array(z.object({
      chunk_id: z.string().uuid(),
      similarity_score: z.number().min(0).max(1),
      content: z.string(),
      document_name: z.string(),
    })).optional(),
  }).optional(),
  error: z.string().optional(),
  tokens_used: z.number().int().min(0).optional(),
  model: z.string().optional(),
});

// Type exports for use in other files
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type RAGContextInput = z.infer<typeof ragContextSchema>;
export type ConversationQueryInput = z.infer<typeof conversationQuerySchema>;
export type MessageQueryInput = z.infer<typeof messageQuerySchema>;
export type ChatResponseOutput = z.infer<typeof chatResponseSchema>;
