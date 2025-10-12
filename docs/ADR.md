# Architecture Decision Records (ADR)

## ADR-001: Framework di Testing - Jest vs Vitest
**Data**: 2025-01-12  
**Status**: ✅ Implementato  

### Decisione
Utilizzare Jest invece di Vitest per il testing.

### Contesto
L'utente ha esplicitamente richiesto Jest per i test.

### Conseguenze
- ✅ Ecosistema maturo e ben documentato
- ✅ Integrazione nativa con Next.js tramite `next/jest`
- ✅ Sistema di mocking potente e flessibile
- ⚠️ Performance leggermente inferiore a Vitest
- ✅ Maggiore compatibilità con librerie di terze parti

---

## ADR-002: Internazionalizzazione - next-intl
**Data**: 2025-01-12  
**Status**: ✅ Implementato  

### Decisione
Utilizzare next-intl per supporto multilingua (inglese + italiano).

### Contesto
Il progetto deve supportare inglese come lingua principale e italiano come traduzione.

### Conseguenze
- ✅ Supporto nativo per App Router di Next.js
- ✅ Routing automatico per locale (`/en/`, `/it/`)
- ✅ Type-safe translations
- ✅ SSR compatibility
- ⚠️ Bundle size leggermente maggiore

---

## ADR-003: Convenzioni Componenti React
**Data**: 2025-01-12  
**Status**: ✅ Implementato  

### Decisione
Tutti i componenti React devono seguire questa convenzione:
```typescript
function ComponentName(): JSX.Element {
  return <div>Content</div>
}
```

### Contesto
Richiesta esplicita dell'utente per consistenza del codebase.

### Conseguenze
- ✅ Consistenza nel codebase
- ✅ Type safety esplicita
- ✅ Facilita refactoring e manutenzione

---

## ADR-004: Data Fetching - SWR/React Query vs useEffect
**Data**: 2025-01-12  
**Status**: 🎯 Da implementare  

### Decisione
Non utilizzare useEffect per data fetching. Preferire SWR (prima scelta) o React Query.

### Contesto
L'utente ha specificato di evitare useEffect per data fetching e preferire soluzioni più robuste.

### Conseguenze
- ✅ Caching automatico
- ✅ Revalidation intelligente
- ✅ Loading states gestiti automaticamente
- ✅ Error handling migliorato
- ⚠️ Dipendenza aggiuntiva

---

## ADR-005: Styling - Tailwind CSS First
**Data**: 2025-01-12  
**Status**: ✅ Implementato  

### Decisione
Utilizzare Tailwind CSS come prima scelta per styling. shadcn/ui e Radix UI solo se Tailwind non è sufficiente.

### Contesto
L'utente preferisce un design system centralizzato con Tailwind.

### Conseguenze
- ✅ Design system consistente
- ✅ Utility-first approach
- ✅ Bundle size ottimizzato
- ✅ Developer experience migliorato
- ⚠️ Learning curve per team nuovi a Tailwind

---

## ADR-006: Database - Supabase con pgvector
**Data**: 2025-01-12  
**Status**: 🎯 Da implementare  

### Decisione
Utilizzare Supabase come database principale con estensione pgvector per similarity search.

### Contesto
Necessità di vector database per RAG pipeline + auth + storage in un'unica soluzione.

### Conseguenze
- ✅ All-in-one solution (DB + Auth + Storage)
- ✅ PostgreSQL con pgvector per embeddings
- ✅ RLS per sicurezza row-level
- ✅ Real-time subscriptions
- ⚠️ Vendor lock-in parziale

---

## ADR-007: AI Provider - OpenAI
**Data**: 2025-01-12  
**Status**: 🎯 Da implementare  

### Decisione
Utilizzare OpenAI per embeddings (text-embedding-3-large) e chat completions (GPT-4o).

### Contesto
Necessità di alta qualità per embeddings e generazione testo nel contesto RAG.

### Conseguenze
- ✅ Qualità embeddings superiore
- ✅ Modelli chat avanzati
- ✅ API stabile e documentata
- ⚠️ Costi per utilizzo
- ⚠️ Dipendenza da provider esterno

---

## Pattern di Sviluppo

### 1. Functional Programming
```typescript
// ✅ Preferito
const processDocument = (doc: Document): ProcessedDocument => {
  return {
    ...doc,
    processed: true,
    timestamp: Date.now()
  }
}

// ❌ Evitare
class DocumentProcessor {
  process(doc: Document) { /* ... */ }
}
```

### 2. Error Handling
```typescript
// ✅ Early returns + guard clauses
function validateUser(user: User): ValidationResult {
  if (!user.email) {
    return { valid: false, error: 'Email required' }
  }
  
  if (!user.password || user.password.length < 6) {
    return { valid: false, error: 'Password too short' }
  }
  
  return { valid: true }
}
```

### 3. Type Safety
```typescript
// ✅ Strict typing
interface TutorConfig {
  tone: 'friendly' | 'professional' | 'casual' | 'academic'
  maxTokens: number
  temperature: number
}

// ❌ Evitare any
function configTutor(config: any) { /* ... */ }
```

### 4. Component Structure
```typescript
// ✅ Struttura standard
function TutorCard({ tutor }: { tutor: Tutor }): JSX.Element {
  const { t } = useTranslations('tutors')
  
  // Early returns per loading/error states
  if (!tutor) return <div>Loading...</div>
  
  // Event handlers
  const handleEdit = () => { /* ... */ }
  
  // Render
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tutor.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

### 5. Testing Patterns
```typescript
// ✅ Descriptive test names
describe('TutorCard', () => {
  it('should display tutor name and description', () => {
    // Arrange
    const mockTutor = { name: 'Test Tutor', description: 'Test' }
    
    // Act
    render(<TutorCard tutor={mockTutor} />)
    
    // Assert
    expect(screen.getByText('Test Tutor')).toBeInTheDocument()
  })
})
```

---

## Prossime Decisioni da Prendere

### 1. State Management Globale
- **Opzioni**: Zustand, Redux Toolkit, React Context
- **Criterio**: Semplicità vs funzionalità avanzate

### 2. Form Validation
- **Opzioni**: react-hook-form + Zod, Formik
- **Criterio**: Performance e DX

### 3. Background Jobs
- **Opzioni**: Supabase Edge Functions, BullMQ + Redis, serverless cron
- **Criterio**: Costi vs funzionalità

### 4. Monitoring & Analytics
- **Opzioni**: Sentry + Vercel Analytics, PostHog, custom solution
- **Criterio**: Privacy vs insights
