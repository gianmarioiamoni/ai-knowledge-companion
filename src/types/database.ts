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
          length_tokens: number | null
          visibility: 'private' | 'public'
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
          length_tokens?: number | null
          visibility?: 'private' | 'public'
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
          length_tokens?: number | null
          visibility?: 'private' | 'public'
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
