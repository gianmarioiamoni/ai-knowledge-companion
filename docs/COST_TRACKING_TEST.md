# 🧪 Cost Tracking - Test Guide

Guida completa per testare l'implementazione del Cost Tracking per Multimedia Processing.

---

## 📋 Pre-requisiti

### 1. Environment Variables
Verifica che nel tuo `.env.local` ci siano:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Server Running
```bash
npm run dev
```

### 3. Account Utente Attivo
- Login effettuato
- Piano attivo (anche Trial)

---

## 🧪 Test 1: Upload File Audio (Raccomandato)

### Passo 1: Prepara File di Test
Crea un file audio breve (30-60 secondi) oppure usa uno esistente:
- Formato: MP3, WAV, M4A
- Dimensione: < 5MB
- Durata: 30-60 secondi (per test veloce)

### Passo 2: Upload File
1. Vai su: `http://localhost:3000/en/multimedia`
2. Clicca su **"Upload Audio"**
3. Seleziona il file
4. Clicca su **"Upload"**

### Passo 3: Monitora i Log
Nel terminale del server vedrai:

```
🔄 Processing multimedia: { documentId: '...', queueId: '...' }
🎤 Transcribing audio...
✅ Transcription completed
✂️  Chunking text...
📑 Created 3 chunks
🧠 Generating embeddings...
✅ Generated 3 embeddings, 245 tokens, cost: $0.0049  ← QUESTO È IL COST TRACKING
📊 Usage logged. Quota: 245/50000                     ← QUESTO È IL QUOTA UPDATE
✅ Processing completed successfully
```

### Passo 4: Verifica Database

#### Query 1: Verifica Billing Tracking
```sql
SELECT 
  created_at,
  user_id,
  action,
  api_calls,
  tokens_used,
  cost_estimate,
  metadata->>'document_id' as document_id,
  metadata->>'document_type' as document_type,
  metadata->>'chunks_count' as chunks_count
FROM public.billing_tracking
WHERE action = 'embedding'
ORDER BY created_at DESC
LIMIT 5;
```

**✅ Risultato Atteso:**
- Nuovo record con timestamp recente
- `action`: `embedding`
- `tokens_used`: > 0 (es. 245)
- `cost_estimate`: > 0 (es. 0.0049)
- `metadata`: JSON con dettagli documento

#### Query 2: Verifica User Quota
```sql
SELECT 
  user_id,
  current_api_calls,
  current_tokens,
  current_cost,
  max_tokens_per_month,
  billing_period_start
FROM public.user_quotas
WHERE user_id = (SELECT auth.uid());
```

**✅ Risultato Atteso:**
- `current_tokens` incrementato
- `current_cost` incrementato
- `current_api_calls` incrementato di 1

#### Query 3: Verifica Processing Queue
```sql
SELECT 
  id,
  status,
  progress,
  chunks_created,
  embeddings_generated,
  processing_cost,
  completed_at
FROM public.media_processing_queue
ORDER BY created_at DESC
LIMIT 5;
```

**✅ Risultato Atteso:**
- `status`: `completed`
- `progress`: 100
- `processing_cost`: > 0 (es. 0.0049)
- `chunks_created`: > 0
- `embeddings_generated`: > 0

---

## 🧪 Test 2: Upload File Immagine

### Passo 1: Upload Immagine
1. Vai su: `http://localhost:3000/en/multimedia`
2. Clicca su **"Upload Image"**
3. Seleziona un'immagine (JPG, PNG)
4. Clicca su **"Upload"**

### Passo 2: Log Attesi
```
🖼️  Analyzing image with Vision API...
✅ Image analysis completed
✂️  Chunking text...
🧠 Generating embeddings...
✅ Generated X embeddings, Y tokens, cost: $Z.ZZZZ
📊 Usage logged. Quota: X/Y
```

### Passo 3: Verifica
Stesse query del Test 1, ma con `document_type`: `image`

---

## 🧪 Test 3: Verifica Quota Exceeded

### Scenario: Simula Superamento Quota

#### Passo 1: Abbassa Temporaneamente la Quota
```sql
UPDATE public.user_quotas
SET max_tokens_per_month = 100  -- Valore molto basso per test
WHERE user_id = (SELECT auth.uid());
```

#### Passo 2: Carica un File
Ripeti Test 1 o Test 2

#### Passo 3: Verifica Warning nei Log
```
⚠️ User xxx has exceeded their quota!
```

#### Passo 4: Ripristina Quota
```sql
UPDATE public.user_quotas
SET max_tokens_per_month = 100000  -- Ripristina valore normale
WHERE user_id = (SELECT auth.uid());
```

---

## 🧪 Test 4: API Endpoint Diretto

### Scenario: Test Manuale dell'Endpoint

#### Passo 1: Ottieni Document ID e Queue ID
```sql
SELECT 
  d.id as document_id,
  mpq.id as queue_id,
  d.title,
  d.media_type,
  mpq.status
FROM public.documents d
JOIN public.media_processing_queue mpq ON d.id = mpq.document_id
WHERE d.owner_id = (SELECT auth.uid())
  AND mpq.status = 'queued'
ORDER BY d.created_at DESC
LIMIT 1;
```

#### Passo 2: Chiama API
```bash
curl -X POST http://localhost:3000/api/multimedia/process \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "DOCUMENT_ID_QUI",
    "queueId": "QUEUE_ID_QUI"
  }'
```

#### Passo 3: Verifica Response
```json
{
  "success": true,
  "documentId": "...",
  "chunks": 3,
  "embeddings": 3,
  "cost": 0.0049
}
```

---

## 📊 Dashboard di Verifica

### Crea Query SQL Utili

#### Dashboard Cost Tracking
```sql
-- Total costs per user (last 30 days)
SELECT 
  u.email,
  COUNT(*) as operations,
  SUM(bt.tokens_used) as total_tokens,
  SUM(bt.cost_estimate) as total_cost
FROM public.billing_tracking bt
JOIN auth.users u ON bt.user_id = u.id
WHERE bt.created_at > NOW() - INTERVAL '30 days'
  AND bt.action = 'embedding'
GROUP BY u.email
ORDER BY total_cost DESC;
```

#### Recent Processing Jobs
```sql
SELECT 
  d.title,
  d.media_type,
  mpq.status,
  mpq.chunks_created,
  mpq.embeddings_generated,
  mpq.processing_cost,
  mpq.completed_at
FROM public.media_processing_queue mpq
JOIN public.documents d ON mpq.document_id = d.id
WHERE d.owner_id = (SELECT auth.uid())
ORDER BY mpq.created_at DESC
LIMIT 10;
```

---

## ✅ Checklist Test Completo

- [ ] Environment variables configurate
- [ ] Server in esecuzione
- [ ] Account utente loggato
- [ ] **Test 1: Audio upload** - ✅ Cost tracked
- [ ] **Test 2: Image upload** - ✅ Cost tracked
- [ ] **Verifica DB: billing_tracking** - ✅ Record creato
- [ ] **Verifica DB: user_quotas** - ✅ Valori aggiornati
- [ ] **Verifica DB: processing_queue** - ✅ Cost popolato
- [ ] **Log server** - ✅ Messaggio "Usage logged"
- [ ] **Test quota exceeded** - ✅ Warning visualizzato

---

## 🐛 Troubleshooting

### Problema: "No cost tracked in logs"

**Possibili Cause:**
1. `OPENAI_API_KEY` non configurata
2. `owner_id` mancante nel documento
3. Errore nella generazione embeddings

**Soluzione:**
```bash
# Verifica .env.local
grep OPENAI_API_KEY .env.local

# Verifica owner_id nel database
SELECT id, owner_id, title FROM documents ORDER BY created_at DESC LIMIT 5;
```

### Problema: "Usage not logged in database"

**Possibili Cause:**
1. Tabella `billing_tracking` non esiste
2. Trigger RLS bloccano l'insert
3. Funzione `log_usage_and_check_quota` non esiste

**Soluzione:**
```sql
-- Verifica tabella
SELECT * FROM public.billing_tracking LIMIT 1;

-- Verifica funzione
SELECT proname FROM pg_proc WHERE proname = 'log_usage_and_check_quota';
```

### Problema: "Quota not updated"

**Possibili Cause:**
1. Trigger non attivo
2. User quota non inizializzata

**Soluzione:**
```sql
-- Verifica trigger
SELECT * FROM pg_trigger WHERE tgname LIKE '%usage%';

-- Inizializza quota manualmente
SELECT * FROM public.get_or_create_user_quota((SELECT auth.uid()));
```

---

## 📚 Riferimenti

- **Code**: `src/app/api/multimedia/process/route.ts`
- **Code**: `src/app/api/multimedia/worker/route.ts`
- **Code**: `src/lib/supabase/billing.ts`
- **Code**: `src/lib/openai/embeddings.ts`
- **SQL**: `sql/28_stripe_integration.sql` (billing_tracking table)

---

## 🎯 Risultato Atteso

Dopo un test completo, dovresti vedere:

✅ **Log Server:**
```
✅ Generated 3 embeddings, 245 tokens, cost: $0.0049
📊 Usage logged. Quota: 245/50000
```

✅ **Database billing_tracking:**
| created_at | action | tokens_used | cost_estimate |
|------------|--------|-------------|---------------|
| 2025-11-17 | embedding | 245 | 0.0049 |

✅ **Database user_quotas:**
| current_tokens | current_cost |
|----------------|--------------|
| 245 | 0.0049 |

✅ **Database processing_queue:**
| status | processing_cost | chunks | embeddings |
|--------|-----------------|--------|------------|
| completed | 0.0049 | 3 | 3 |

---

**Il Cost Tracking funziona correttamente!** 🎉

