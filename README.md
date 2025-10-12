# AI Knowledge Companion

Una piattaforma web dove un utente carica materiali (PDF, link, note), il sistema crea embeddings e consente di interrogare un "tutor AI" personalizzato che risponde con conoscenza limitata al materiale caricato; ogni tutor è configurabile e può essere condiviso o venduto.

## Documentazione del Progetto

### 📋 File di Riferimento per Claude AI
- **[CLAUDE.md](./CLAUDE.md)** - Specifiche complete del progetto, architettura e convenzioni
- **[docs/ADR.md](./docs/ADR.md)** - Architecture Decision Records e pattern di sviluppo
- **[docs/API.md](./docs/API.md)** - Contratti API completi e specifiche endpoint

### 🎯 Per Sviluppatori
Leggere sempre `CLAUDE.md` per comprendere:
- Architettura completa del sistema
- Convenzioni di codice obbligatorie
- Schema database dettagliato
- Pipeline RAG e configurazioni
- Milestones e acceptance criteria

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth + Storage + pgvector)
- **AI**: OpenAI (Embeddings + Chat Completions)
- **Testing**: Vitest, Testing Library
- **Package Manager**: pnpm

## Caratteristiche Principali (MVP)

- ✅ Autenticazione utenti (email/password + magic link via Supabase Auth)
- ✅ Upload e gestione materiali (PDF, txt, link) su Supabase Storage
- ✅ Parsing e chunking dei documenti, creazione embeddings (OpenAI Embeddings)
- ✅ Retrieval-augmented generation (RAG) per rispondere a domande sul materiale
- ✅ Interfaccia per creare + configurare "Tutor" (tono, livello, lingua, permissività)
- ✅ Salvataggio cronologia conversazioni + log uso
- ✅ Condivisione pubblica / marketplace di tutor

## Setup del Progetto

### Prerequisiti

- Node.js 18+ 
- pnpm
- Account Supabase
- API Key OpenAI

### Installazione

1. Clona il repository:
```bash
git clone <repository-url>
cd ai-knowledge-companion
```

2. Installa le dipendenze:
```bash
pnpm install
```

3. Configura le variabili d'ambiente:
```bash
cp .env.example .env.local
```

Modifica `.env.local` con le tue credenziali:
- Supabase URL e Keys
- OpenAI API Key

4. Setup del database Supabase:
- Crea un nuovo progetto su [Supabase](https://supabase.com)
- Abilita l'estensione pgvector nel Database
- Esegui le migrazioni SQL (vedi `/sql/migrations/`)

5. Avvia il server di sviluppo:
```bash
pnpm dev
```

## Struttura del Progetto

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Pagine autenticazione
│   ├── dashboard/         # Dashboard utente
│   ├── tutors/           # Gestione tutor
│   ├── documents/        # Gestione documenti
│   └── marketplace/      # Marketplace pubblico
├── components/            # Componenti React
│   ├── auth/             # Componenti autenticazione
│   ├── documents/        # Componenti documenti
│   ├── tutors/           # Componenti tutor
│   ├── chat/             # Interfaccia chat
│   └── ui/               # Componenti UI base (shadcn)
├── lib/                  # Utilities e configurazioni
│   ├── supabase/         # Client Supabase
│   ├── openai/           # Client OpenAI
│   └── utils/            # Utility functions
├── types/                # Definizioni TypeScript
├── hooks/                # Custom React hooks
└── workers/              # Background jobs
```

## Scripts Disponibili

```bash
pnpm dev          # Avvia il server di sviluppo
pnpm build        # Build per produzione
pnpm start        # Avvia il server di produzione
pnpm lint         # Esegue ESLint
pnpm test         # Esegue i test con Vitest
pnpm test:watch   # Esegue i test in modalità watch
```

## Convenzioni di Sviluppo

### Stile del Codice

- **TypeScript**: strict mode abilitato
- **React Components**: `function ComponentName(): JSX.Element {}`
- **Naming**: camelCase per variabili, PascalCase per componenti
- **Directory**: lowercase con dash (es. `auth-wizard`)

### Principi di Sviluppo

- **SOLID Principles**: Applicati in tutto il codebase
- **TDD**: Test-driven development quando possibile
- **Functional Programming**: Preferire funzioni pure e immutabilità
- **Clean Code**: Codice leggibile e manutenibile

### Testing

- Unit tests per utilities e business logic
- Integration tests per API routes
- E2E tests per flussi critici
- Coverage target: 80%+

## Architettura

### RAG Pipeline

1. **Upload**: File salvato su Supabase Storage
2. **Parsing**: Estrazione testo (PDF, plain text)
3. **Chunking**: Divisione in chunk da 500-800 token con overlap
4. **Embedding**: Creazione embeddings con OpenAI
5. **Storage**: Salvataggio in PostgreSQL con pgvector
6. **Query**: Similarity search + GPT completion

### Database Schema

Vedi `src/types/database.ts` per lo schema completo:

- `profiles`: Profili utente
- `documents`: Documenti caricati
- `document_chunks`: Chunk con embeddings
- `tutors`: Configurazioni tutor
- `conversations`: Cronologia chat
- `messages`: Messaggi singoli
- `usage_logs`: Tracking utilizzo

## Deployment

### Vercel (Raccomandato)

1. Collega il repository a Vercel
2. Configura le environment variables
3. Deploy automatico su push

### Supabase

- Database e Auth gestiti da Supabase
- Storage per file uploads
- Edge Functions per background jobs (opzionale)

## Roadmap

### Sprint 1 - Documents Flow (2 settimane)
- [ ] Upload UI + storage
- [ ] Worker: parsing + chunking
- [ ] Document list + preview

### Sprint 2 - Embeddings + RAG (2 settimane)
- [ ] Integrate OpenAI Embeddings
- [ ] pgvector setup
- [ ] Retrieval endpoint + chat UI

### Sprint 3 - Tutors + Conversation (2 settimane)
- [ ] Tutor CRUD + config UI
- [ ] Conversation history
- [ ] Source citation display

### Sprint 4 - Marketplace + Polish (2-3 settimane)
- [ ] Marketplace pages
- [ ] Usage tracking + billing
- [ ] Deploy + monitoring

## Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/amazing-feature`)
3. Commit le modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## Licenza

MIT License - vedi `LICENSE` per dettagli.

## Supporto

Per domande o supporto:
- Apri un issue su GitHub
- Consulta la documentazione in `/docs`
- Controlla le FAQ nel wiki