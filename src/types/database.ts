export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          settings: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          settings?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          settings?: Record<string, any> | null
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          source_url: string | null
          storage_path: string
          mime_type: string
          file_size: number | null
          length_tokens: number | null
          visibility: 'private' | 'public'
          status: 'processing' | 'ready' | 'error'
          // Multimedia fields
          media_type: 'document' | 'audio' | 'video' | 'image'
          duration_seconds: number | null
          width: number | null
          height: number | null
          thumbnail_url: string | null
          transcription_status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_required'
          transcription_text: string | null
          transcription_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          source_url?: string | null
          storage_path: string
          mime_type: string
          file_size?: number | null
          length_tokens?: number | null
          visibility?: 'private' | 'public'
          status?: 'processing' | 'ready' | 'error'
          // Multimedia fields
          media_type?: 'document' | 'audio' | 'video' | 'image'
          duration_seconds?: number | null
          width?: number | null
          height?: number | null
          thumbnail_url?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_required'
          transcription_text?: string | null
          transcription_cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          source_url?: string | null
          storage_path?: string
          mime_type?: string
          file_size?: number | null
          length_tokens?: number | null
          visibility?: 'private' | 'public'
          status?: 'processing' | 'ready' | 'error'
          // Multimedia fields
          media_type?: 'document' | 'audio' | 'video' | 'image'
          duration_seconds?: number | null
          width?: number | null
          height?: number | null
          thumbnail_url?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_required'
          transcription_text?: string | null
          transcription_cost?: number | null
          updated_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          chunk_index: number
          text: string
          tokens: number
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          chunk_index: number
          text: string
          tokens: number
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          chunk_index?: number
          text?: string
          tokens?: number
          embedding?: number[] | null
        }
      }
      tutors: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          config: Record<string, any>
          version: number
          visibility: 'private' | 'public' | 'marketplace'
          price: number
          is_free: boolean
          downloads_count: number
          forks_count: number
          rating_average: number
          reviews_count: number
          category: string | null
          tags: string[]
          featured: boolean
          original_tutor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          config?: Record<string, any>
          version?: number
          visibility?: 'private' | 'public' | 'marketplace'
          price?: number
          is_free?: boolean
          downloads_count?: number
          forks_count?: number
          rating_average?: number
          reviews_count?: number
          category?: string | null
          tags?: string[]
          featured?: boolean
          original_tutor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          config?: Record<string, any>
          version?: number
          visibility?: 'private' | 'public' | 'marketplace'
          price?: number
          is_free?: boolean
          downloads_count?: number
          forks_count?: number
          rating_average?: number
          reviews_count?: number
          category?: string | null
          tags?: string[]
          featured?: boolean
          original_tutor_id?: string | null
          updated_at?: string
        }
      }
      tutor_documents: {
        Row: {
          id: string
          tutor_id: string
          document_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          document_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          document_id?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          tutor_id: string
          metadata: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tutor_id: string
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tutor_id?: string
          metadata?: Record<string, any> | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender: 'user' | 'assistant' | 'system'
          role: string
          text: string
          tokens: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender: 'user' | 'assistant' | 'system'
          role: string
          text: string
          tokens?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender?: 'user' | 'assistant' | 'system'
          role?: string
          text?: string
          tokens?: number | null
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          tutor_id: string | null
          api_calls: number
          cost_estimate: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tutor_id?: string | null
          api_calls?: number
          cost_estimate?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tutor_id?: string | null
          api_calls?: number
          cost_estimate?: number
        }
      }
      tutor_reviews: {
        Row: {
          id: string
          tutor_id: string
          user_id: string
          rating: number
          review_text: string | null
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          user_id: string
          rating: number
          review_text?: string | null
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          user_id?: string
          rating?: number
          review_text?: string | null
          helpful_count?: number
          updated_at?: string
        }
      }
      tutor_forks: {
        Row: {
          id: string
          original_tutor_id: string
          forked_tutor_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          original_tutor_id: string
          forked_tutor_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          original_tutor_id?: string
          forked_tutor_id?: string
          user_id?: string
        }
      }
      tutor_views: {
        Row: {
          id: string
          tutor_id: string
          user_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          user_id?: string | null
          session_id?: string | null
        }
      }
      media_processing_queue: {
        Row: {
          id: string
          document_id: string
          user_id: string
          media_type: 'audio' | 'video' | 'image'
          status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
          progress_percent: number
          processing_started_at: string | null
          processing_completed_at: string | null
          error_message: string | null
          retry_count: number
          max_retries: number
          chunks_created: number
          embeddings_generated: number
          processing_cost: number | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          media_type: 'audio' | 'video' | 'image'
          status?: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
          progress_percent?: number
          processing_started_at?: string | null
          processing_completed_at?: string | null
          error_message?: string | null
          retry_count?: number
          max_retries?: number
          chunks_created?: number
          embeddings_generated?: number
          processing_cost?: number | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          media_type?: 'audio' | 'video' | 'image'
          status?: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
          progress_percent?: number
          processing_started_at?: string | null
          processing_completed_at?: string | null
          error_message?: string | null
          retry_count?: number
          max_retries?: number
          chunks_created?: number
          embeddings_generated?: number
          processing_cost?: number | null
          metadata?: Record<string, any>
          updated_at?: string
        }
      }
      tutor_multimedia: {
        Row: {
          id: string
          tutor_id: string
          document_id: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          document_id: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          document_id?: string
          display_order?: number
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentChunk = Database['public']['Tables']['document_chunks']['Row']
export type Tutor = Database['public']['Tables']['tutors']['Row']
export type TutorDocument = Database['public']['Tables']['tutor_documents']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type TutorReview = Database['public']['Tables']['tutor_reviews']['Row']
export type TutorFork = Database['public']['Tables']['tutor_forks']['Row']
export type TutorView = Database['public']['Tables']['tutor_views']['Row']
export type MediaProcessingQueue = Database['public']['Tables']['media_processing_queue']['Row']
export type TutorMultimedia = Database['public']['Tables']['tutor_multimedia']['Row']

export interface TutorConfig {
  tone: 'friendly' | 'professional' | 'casual' | 'academic'
  max_tokens: number
  temperature: number
  language: string
  retrieval_k: number
  allow_web_search: boolean
  system_instructions?: string
}

export interface QueryRequest {
  question: string
  conversation_id?: string
}

export interface QueryResponse {
  answer: string
  sources: Array<{
    document_id: string
    chunk_index: number
    excerpt: string
    document_title?: string
  }>
  tokens: {
    prompt_tokens: number
    completion_tokens: number
    total: number
  }
  cost_estimate: number
  conversation_id: string
}
