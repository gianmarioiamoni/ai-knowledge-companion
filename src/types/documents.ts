// Document types based on project specifications

export interface Document {
  id: string
  owner_id: string
  title: string
  description?: string
  source_url?: string
  storage_path: string
  mime_type: string
  file_size?: number
  length_tokens?: number
  visibility: 'private' | 'public'
  created_at: string
  updated_at: string
}

// Extended document type with additional properties used in UI
export interface DocumentWithStatus extends Document {
  status?: 'processed' | 'processing' | 'error' | 'unknown'
  file_type?: string
  name?: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  chunk_index: number
  text: string
  tokens: number
  embedding?: number[] // Will be added in Sprint 2
  created_at: string
}

export interface DocumentUpload {
  file: File
  title: string
  description?: string
  visibility: 'private' | 'public'
}

export interface DocumentProcessingStatus {
  document_id: string
  status: 'uploading' | 'parsing' | 'chunking' | 'processed' | 'error'
  progress: number
  error_message?: string
}

// Supported file types
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

export type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number]

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES_PER_UPLOAD = 5

// Chunking configuration
export const CHUNK_CONFIG = {
  MIN_TOKENS: 500,
  MAX_TOKENS: 800,
  OVERLAP_TOKENS: 100
} as const
