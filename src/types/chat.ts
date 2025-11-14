// Chat System Types for AI Knowledge Companion

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tokens_used: number;
  model?: string;
  temperature?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface MessageRAGContext {
  id: string;
  message_id: string;
  chunk_id: string;
  similarity_score: number;
  created_at: string;
}

export interface MessageWithRAGContext extends Message {
  rag_chunks: RAGChunk[];
}

export interface RAGChunk {
  chunk_id: string;
  similarity_score: number;
  content: string;
  document_name: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  tutor_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
  is_archived: boolean;
  metadata?: Record<string, any>;
}

export interface ConversationWithTutor extends Conversation {
  tutor_name: string;
  tutor_avatar_url?: string;
  tutor_model: string;
}

export interface ConversationInsert {
  user_id: string;
  tutor_id: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface ConversationQueryInput {
  tutor_id?: string;
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface MessageQueryInput {
  conversation_id: string;
  limit?: number;
  offset?: number;
}

export interface MessageInsert {
  conversation_id: string;
  role: MessageRole;
  sender: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  model?: string;
  temperature?: number;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  tokens_used?: number;
  model?: string;
  rag_chunks?: RAGChunk[];
}

export interface ChatConversation {
  id: string;
  title: string;
  tutor: {
    id: string;
    name: string;
    avatar_url?: string;
    model: string;
  };
  last_message_at: string;
  message_count: number;
  is_archived: boolean;
}

// Chat UI State Types
export interface ChatState {
  conversations: ChatConversation[];
  currentConversation: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export interface ChatActions {
  createConversation: (tutorId: string, title?: string) => Promise<{ success: boolean; conversationId?: string; error?: string }>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  renameConversation: (conversationId: string, newTitle: string) => Promise<{ success: boolean; error?: string }>;
  deleteConversation: (conversationId: string) => Promise<{ success: boolean; error?: string }>;
  archiveConversation: (conversationId: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllConversations: () => Promise<{ success: boolean; error?: string }>;
  archiveAllConversations: () => Promise<{ success: boolean; error?: string }>;
  setCurrentConversation: (conversationId: string | null) => void;
  clearError: () => void;
}

// RAG Integration Types
export interface RAGResponse {
  answer: string;
  sources: RAGChunk[];
  tokens_used: number;
  model: string;
  temperature: number;
}

export interface ChatRequest {
  message: string;
  conversation_id: string;
  tutor_id: string;
}

export interface ChatResponse {
  success: boolean;
  message?: MessageWithRAGContext;
  error?: string;
  tokens_used?: number;
  model?: string;
}

// Chat UI Component Props
export interface ChatInterfaceProps {
  tutorId: string;
  conversationId?: string;
  tutor?: import('./tutors').Tutor;
  locale?: string;
  onClose?: () => void;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

export interface ConversationListProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onArchiveConversation: (id: string) => void;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Constants
export const MESSAGE_ROLES: MessageRole[] = ['user', 'assistant', 'system'];

export const DEFAULT_CHAT_CONFIG = {
  maxTokens: 2000,
  temperature: 0.7,
  model: 'gpt-4o-mini',
} as const;

export const CHAT_UI_CONFIG = {
  maxMessages: 100,
  autoScrollDelay: 100,
  typingIndicatorDelay: 1000,
} as const;
