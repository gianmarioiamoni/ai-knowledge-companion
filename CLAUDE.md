# AI Knowledge Companion - Specifiche Progetto per Claude

## 📋 Panoramica Progetto

**Nome**: AI Knowledge Companion  
**Descrizione**: Assistente personale di apprendimento dove l'utente costruisce il proprio "AI tutor" personale per imparare qualsiasi argomento (lingue, coding, storia, etc.)

### Concept Chiave

- Gli utenti caricano materiali (link, PDF, note) in Supabase
- L'app crea embedding vettoriali per il materiale
- Consente di fare domande sul proprio contenuto (RAG con OpenAI)
- Ogni "tutor" ha un profilo configurabile (tono, livello di dettaglio, lingua)
- Possibilità di condividere pubblicamente i propri tutor o venderli come "preset"

## 🏗️ Architettura Tecnica

### Stack Tecnologico OBBLIGATORIO

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS (prima scelta), shadcn/ui, Radix UI (solo se Tailwind non basta)
- **Backend**: Next.js API Routes (Route Handlers)
- **Database**: Supabase (PostgreSQL + Auth + Storage + pgvector)
- **AI**: OpenAI (embeddings + chat completions + Whisper opzionale)
- **Testing**: Jest (richiesto dall'utente, non Vitest)
- **Package Manager**: pnpm
- **Internazionalizzazione**: next-intl (inglese principale, italiano traduzione)

### Convenzioni di Codice OBBLIGATORIE

```typescript
// Componenti React DEVONO essere definiti nel seguente modo:
function ComponentName(): JSX.Element {
  return <div>...</div>;
}
```

### Principi di Sviluppo RICHIESTI

- **SOLID Principles**: Sempre applicati
- **TDD**: Test-driven development quando possibile
- **Functional Programming**: Preferire funzioni pure, evitare classi
- **Clean Code**: Codice leggibile e manutenibile
- **No useEffect per data fetching**: Usare SWR o React Query
- **Design System centralizzato**: Tipografia e stili con Tailwind e shadcn
- **SRP applicato ai componenti React**: logica sempre esterna la componente, implementata come custom hooks e funzioni importate. SPezzare i componenti grandi in sottocomponenti elementari.

## 🗄️ Schema Database (Supabase)

### Tabelle Principali

```sql
-- Gestito da Supabase Auth
users (id, email, created_at)

-- Profili utente
profiles (id, display_name, bio, avatar_url, settings, created_at, updated_at)

-- Documenti caricati
documents (id, owner_id, title, description, source_url, storage_path, mime_type, length_tokens, visibility, created_at, updated_at)

-- Chunk dei documenti con embeddings
document_chunks (id, document_id, chunk_index, text, tokens, embedding, created_at)

-- Tutor AI configurabili
tutors (id, owner_id, name, description, config, version, visibility, created_at, updated_at)

-- Collegamento tutor-documenti
tutor_documents (id, tutor_id, document_id, created_at)

-- Conversazioni
conversations (id, user_id, tutor_id, metadata, created_at, updated_at)

-- Messaggi delle conversazioni
messages (id, conversation_id, sender, role, text, tokens, created_at)

-- Log di utilizzo per billing
usage_logs (id, user_id, tutor_id, api_calls, cost_estimate, created_at)
```

### Configurazioni Importanti

- **RLS (Row Level Security)**: Obbligatorio per tutte le tabelle
- **pgvector**: Per similarity search degli embeddings
- **Indici**: `document_chunks(document_id, chunk_index)` e `document_chunks USING ivfflat (embedding vector_cosine_ops)`

## 🤖 Pipeline RAG

### Flusso Completo

1. **Upload**: File → Supabase Storage
2. **Parsing**: Estrazione testo (PDF: pdf-parse, plain text)
3. **Chunking**: 500-800 token per chunk, overlap 50-100 token
4. **Embedding**: OpenAI text-embedding-3-large → vettore
5. **Storage**: Chunk + embedding in PostgreSQL
6. **Query**: Similarity search (k=8) + GPT-4o completion
7. **Response**: Risposta + source citation + cost tracking

### Configurazione Tutor

```typescript
interface TutorConfig {
  tone: "friendly" | "professional" | "casual" | "academic";
  max_tokens: number;
  temperature: number;
  language: string;
  retrieval_k: number;
  allow_web_search: boolean;
  system_instructions?: string;
}
```

## 🌐 Internazionalizzazione

### Configurazione next-intl

- **Lingue**: Inglese (en) - principale, Italiano (it) - traduzione
- **Struttura**: `src/app/[locale]/` per routing
- **Traduzioni**: `/messages/en.json` e `/messages/it.json`
- **Route localizzate**: `/en/tutors` → `/it/tutor`, `/en/documents` → `/it/documenti`

## 📁 Struttura Progetto

```
src/
├── app/
│   ├── [locale]/           # Routing internazionale
│   │   ├── auth/          # Login/signup
│   │   ├── dashboard/     # Dashboard utente
│   │   ├── tutors/        # Gestione tutor
│   │   ├── documents/     # Gestione documenti
│   │   └── marketplace/   # Marketplace pubblico
│   └── api/               # API Routes
├── components/
│   ├── auth/             # Componenti autenticazione
│   ├── documents/        # Gestione documenti
│   ├── tutors/           # Gestione tutor
│   ├── chat/             # Interfaccia chat
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── supabase/         # Client Supabase (client, server, middleware)
│   ├── openai/           # Client OpenAI
│   └── utils/            # Utility functions
├── types/                # Database types + API contracts
├── hooks/                # Custom React hooks
└── workers/              # Background jobs
```

## 🧪 Testing con Jest

### Configurazione

- **Framework**: Jest 30+ con next/jest
- **Environment**: jsdom per componenti React
- **Coverage**: Target 80%+
- **Mocks**: next/navigation, next-intl, Supabase

### Tipi di Test

- **Unit**: Utilities e business logic
- **Integration**: API routes con DB mock
- **E2E**: Flussi critici (upload → process → query)

## 🚀 Milestones MVP

### Sprint 0: Setup (1 settimana) - ✅ COMPLETATO

- ✅ Repo + CI + TypeScript + Next.js + shadcn scaffold
- ✅ Supabase project init + RLS baseline (configurazione pronta)
- 🔄 Auth flows (signup/login) - **DA IMPLEMENTARE**

### Sprint 1: Documents Flow (2 settimane) - 🎯 PROSSIMO

- [ ] Upload UI + storage
- [ ] Worker: parsing + chunking local implementation (no embeddings yet)
- [ ] Document list + preview

### Sprint 2: Embeddings + RAG (2 settimane)

- [ ] Integrate OpenAI Embeddings
- [ ] Store embeddings in pgvector
- [ ] Implement retrieval endpoint + basic prompt builder
- [ ] Chat UI minimal

### Sprint 3: Tutors + Conversation (2 settimane)

- [ ] Tutor CRUD + config UI
- [ ] Conversation history save
- [ ] Source citation display

### Sprint 4: Polish + Marketplace + Billing (2-3 settimane)

- [ ] Marketplace pages + fork
- [ ] Usage tracking + cost estimates
- [ ] Deploy to Vercel + basic analytics + Sentry

## 🔧 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 📝 Note Implementative

### Security & Privacy

- RLS policies rigorose su tutte le tabelle
- Non loggare testi utente in plain text
- Rate limiting per API abuse prevention
- Validazione input con Zod

### Performance

- Cache embeddings per riuso
- Throttle embedding jobs per utente
- Stima token e costi in real-time
- Lazy loading per UI components

### Deployment

- **Vercel**: Per Next.js app
- **Supabase**: Database + Auth + Storage gestiti
- **GitHub Actions**: CI/CD pipeline
- **Sentry**: Error monitoring

## 🎯 Acceptance Criteria

### Per ogni feature:

- **Upload**: File salvato + metadata in DB + parsing job avviato
- **Embeddings**: Chunk persistente + similarity search funzionante
- **Query**: Domanda → risposta pertinente + source citation
- **Auth/RLS**: Isolamento dati tra utenti
- **Marketplace**: Fork crea nuovo tutor con riferimenti copiati

---

**Ultimo aggiornamento**: Migrazione da Vitest a Jest completata  
**Stato corrente**: Setup base completo, pronto per Sprint 2 (vedi Documents Flow)
