# API Contracts & Specifications

## 📡 Endpoint Specifications

### Authentication Endpoints
Gestiti da Supabase Auth, ma con wrapper custom se necessario.

```typescript
// POST /api/auth/signup
interface SignupRequest {
  email: string
  password: string
  displayName?: string
}

interface SignupResponse {
  user: User | null
  error?: string
}

// POST /api/auth/login  
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User | null
  session: Session | null
  error?: string
}
```

### Documents Endpoints

```typescript
// POST /api/documents
interface UploadDocumentRequest {
  // multipart/form-data
  file: File
  title: string
  description?: string
  visibility?: 'private' | 'shared' | 'public'
}

interface UploadDocumentResponse {
  document_id: string
  status: 'uploaded' | 'processing' | 'error'
  message?: string
}

// GET /api/documents
interface GetDocumentsResponse {
  documents: Document[]
  pagination: {
    total: number
    page: number
    limit: number
    hasNext: boolean
  }
}

// GET /api/documents/:id
interface GetDocumentResponse {
  document: Document
  chunks?: DocumentChunk[]
  processing_status: 'pending' | 'processing' | 'completed' | 'error'
}

// POST /api/documents/:id/process
interface ProcessDocumentRequest {
  force_reprocess?: boolean
}

interface ProcessDocumentResponse {
  job_id: string
  status: 'queued' | 'processing'
  estimated_time?: number
}

// DELETE /api/documents/:id
interface DeleteDocumentResponse {
  success: boolean
  message?: string
}
```

### Tutors Endpoints

```typescript
// POST /api/tutors
interface CreateTutorRequest {
  name: string
  description?: string
  config: TutorConfig
  document_ids: string[]
  visibility?: 'private' | 'public' | 'marketplace'
}

interface CreateTutorResponse {
  tutor_id: string
  tutor: Tutor
}

// GET /api/tutors
interface GetTutorsResponse {
  tutors: Tutor[]
  pagination: PaginationMeta
}

// GET /api/tutors/:id
interface GetTutorResponse {
  tutor: Tutor
  documents: Document[]
  stats?: {
    total_conversations: number
    total_messages: number
    avg_rating?: number
  }
}

// PUT /api/tutors/:id
interface UpdateTutorRequest {
  name?: string
  description?: string
  config?: Partial<TutorConfig>
  document_ids?: string[]
  visibility?: 'private' | 'public' | 'marketplace'
}

// POST /api/tutors/:id/query
interface QueryTutorRequest {
  question: string
  conversation_id?: string
  stream?: boolean
}

interface QueryTutorResponse {
  answer: string
  sources: Array<{
    document_id: string
    document_title: string
    chunk_index: number
    excerpt: string
    similarity_score: number
  }>
  tokens: {
    prompt_tokens: number
    completion_tokens: number
    total: number
  }
  cost_estimate: number
  conversation_id: string
  message_id: string
}

// POST /api/tutors/:id/fork
interface ForkTutorRequest {
  name: string
  description?: string
}

interface ForkTutorResponse {
  tutor_id: string
  forked_tutor: Tutor
}
```

### Conversations Endpoints

```typescript
// GET /api/conversations
interface GetConversationsResponse {
  conversations: Array<{
    id: string
    tutor_id: string
    tutor_name: string
    last_message: string
    last_message_at: string
    message_count: number
  }>
  pagination: PaginationMeta
}

// GET /api/conversations/:id
interface GetConversationResponse {
  conversation: Conversation
  messages: Message[]
  tutor: Pick<Tutor, 'id' | 'name' | 'config'>
}

// DELETE /api/conversations/:id
interface DeleteConversationResponse {
  success: boolean
}
```

### Marketplace Endpoints

```typescript
// GET /api/marketplace/tutors
interface GetMarketplaceTutorsRequest {
  category?: string
  search?: string
  sort?: 'newest' | 'popular' | 'rating'
  page?: number
  limit?: number
}

interface GetMarketplaceTutorsResponse {
  tutors: Array<{
    id: string
    name: string
    description: string
    author: {
      id: string
      display_name: string
      avatar_url?: string
    }
    stats: {
      downloads: number
      rating: number
      review_count: number
    }
    tags: string[]
    price?: number
    preview_available: boolean
  }>
  pagination: PaginationMeta
  filters: {
    categories: string[]
    price_ranges: Array<{ min: number, max: number, label: string }>
  }
}

// GET /api/marketplace/tutors/:id
interface GetMarketplaceTutorResponse {
  tutor: MarketplaceTutor
  author: PublicProfile
  reviews: Review[]
  similar_tutors: MarketplaceTutor[]
}

// POST /api/marketplace/tutors/:id/purchase
interface PurchaseTutorRequest {
  payment_method?: string
}

interface PurchaseTutorResponse {
  success: boolean
  tutor_id: string
  transaction_id?: string
}
```

### Usage & Analytics Endpoints

```typescript
// GET /api/usage/stats
interface GetUsageStatsResponse {
  current_month: {
    api_calls: number
    cost: number
    documents_processed: number
    conversations: number
  }
  limits: {
    api_calls_limit: number
    documents_limit: number
    storage_limit_mb: number
  }
  usage_history: Array<{
    date: string
    api_calls: number
    cost: number
  }>
}

// GET /api/usage/costs
interface GetCostBreakdownResponse {
  breakdown: {
    embeddings: { calls: number, cost: number }
    completions: { calls: number, cost: number }
    storage: { mb_used: number, cost: number }
  }
  projections: {
    monthly_estimate: number
    daily_average: number
  }
}
```

## 🔧 Common Types

```typescript
// Shared interfaces
interface PaginationMeta {
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, any>
}

interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

// Database types (from src/types/database.ts)
interface TutorConfig {
  tone: 'friendly' | 'professional' | 'casual' | 'academic'
  max_tokens: number
  temperature: number
  language: string
  retrieval_k: number
  allow_web_search: boolean
  system_instructions?: string
}

interface Document {
  id: string
  owner_id: string
  title: string
  description: string | null
  source_url: string | null
  storage_path: string | null
  mime_type: string | null
  length_tokens: number | null
  visibility: 'private' | 'shared' | 'public'
  created_at: string
  updated_at: string
}

interface DocumentChunk {
  id: string
  document_id: string
  chunk_index: number
  text: string
  tokens: number
  embedding: number[] | null
  created_at: string
}

interface Tutor {
  id: string
  owner_id: string
  name: string
  description: string | null
  config: TutorConfig
  version: number
  visibility: 'private' | 'public' | 'marketplace'
  created_at: string
  updated_at: string
}
```

## 🚨 Error Handling Standards

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (RLS violation)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Error Response Format
```typescript
interface APIError {
  error: string              // Human-readable message
  code?: string             // Machine-readable code
  field?: string            // Field causing validation error
  details?: any             // Additional context
  timestamp: string         // ISO 8601 timestamp
  request_id?: string       // For debugging
}

// Examples:
{
  "error": "Document not found",
  "code": "DOCUMENT_NOT_FOUND",
  "timestamp": "2025-01-12T10:30:00Z",
  "request_id": "req_123"
}

{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "field": "email",
  "details": { "expected": "valid email", "received": "invalid-email" },
  "timestamp": "2025-01-12T10:30:00Z"
}
```

## 🔐 Authentication & Authorization

### Headers
```typescript
// Required for authenticated endpoints
Authorization: Bearer <supabase_session_token>

// Optional for client identification
X-Client-Version: 1.0.0
X-Request-ID: req_unique_id
```

### RLS Policies
Tutti gli endpoint devono rispettare le Row Level Security policies:
- `documents`: Solo owner può leggere/modificare documenti private
- `tutors`: Solo owner può modificare, visibilità controlla lettura
- `conversations`: Solo partecipanti possono accedere
- `usage_logs`: Solo owner può vedere i propri log

## 📊 Rate Limiting

### Limiti per Endpoint
```typescript
interface RateLimits {
  '/api/tutors/*/query': '10/minute'     // Query AI intensive
  '/api/documents': '5/minute'           // Upload documents
  '/api/documents/*/process': '2/minute' // Processing jobs
  '/api/auth/*': '5/minute'              // Auth endpoints
  'default': '60/minute'                 // Altri endpoints
}
```

### Headers di Rate Limiting
```typescript
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1642086400
X-RateLimit-Retry-After: 60  // Solo se 429
```

## 🧪 Testing Contracts

### Mock Responses
Ogni endpoint deve avere mock responses per testing:

```typescript
// src/test/mocks/api.ts
export const mockApiResponses = {
  'POST /api/tutors/:id/query': {
    answer: 'Mock answer based on your documents...',
    sources: [
      {
        document_id: 'doc_123',
        document_title: 'Test Document',
        chunk_index: 0,
        excerpt: 'Relevant text excerpt...',
        similarity_score: 0.85
      }
    ],
    tokens: { prompt_tokens: 100, completion_tokens: 50, total: 150 },
    cost_estimate: 0.002,
    conversation_id: 'conv_123',
    message_id: 'msg_456'
  }
}
```

---

**Nota**: Questi contracts devono essere mantenuti sincronizzati con l'implementazione effettiva. Ogni modifica all'API deve essere documentata qui e nei test corrispondenti.
