# 🧪 Test Upload Immagine Reale - Guida Completa

## ✅ Fix Applicati

1. **API Response Fix**: L'API ora restituisce `{ files: documents }` invece di `{ documents }`
2. **Il quadrato verde**: Era l'immagine test di 1x1 pixel usata per debug

---

## 🧹 Step 1: Pulisci Immagini Test

### Opzione A: Via SQL (Consigliato)

1. **Apri Supabase SQL Editor**
2. **Esegui lo script**:
   ```
   sql/CLEANUP_TEST_IMAGES.sql
   ```

Questo elimina tutte le immagini più piccole di 1KB (le immagini test).

### Opzione B: Via UI

1. **Ricarica la pagina** dell'app (Ctrl/Cmd + Shift + R)
2. Vai su **Multimedia → Images**
3. Se vedi l'immagine test (70 bytes), clicca **Delete**

---

## 📸 Step 2: Carica un'Immagine Vera

### Prepara un'Immagine

Scegli **una di queste opzioni**:

#### Opzione 1: Screenshot con Testo
- Fai uno screenshot di questo documento
- Oppure uno screenshot di codice
- L'AI potrà leggere il testo!

#### Opzione 2: Foto
- Una foto qualsiasi dal tuo computer
- L'AI descriverà cosa vede

#### Opzione 3: Diagramma/Chart
- Un diagramma tecnico
- Un grafico o chart
- L'AI spiegherà il contenuto

### Carica nell'App

1. **Vai su** `Multimedia → Images`
2. **Click** sull'area di drop o sul bottone "Browse"
3. **Seleziona** un'immagine reale (non più piccola di 10KB)
4. **Verifica** l'anteprima (dovrebbe mostrare l'immagine reale, non un quadrato verde!)
5. **Click** "Upload All"

---

## ✅ Step 3: Verifica Upload

### 1. Controlla che l'upload sia riuscito

Dovresti vedere un messaggio di successo:
```
✓ Image file uploaded successfully. Processing started.
```

### 2. Ricarica la pagina

**Hard reload**: Ctrl/Cmd + Shift + R

L'immagine dovrebbe ora apparire nella lista con:
- ✅ Anteprima dell'immagine reale
- ✅ Nome file corretto
- ✅ Dimensione file corretta (non 70 bytes!)
- ✅ Badge "Processing" o "Pending"

### 3. Verifica nel Database

**Supabase SQL Editor**:

```sql
-- Controlla che l'immagine sia nel database
SELECT 
  id,
  title,
  file_size,
  media_type,
  status,
  transcription_status,
  created_at
FROM documents
WHERE media_type = 'image'
ORDER BY created_at DESC
LIMIT 1;
```

**Risultato atteso**:
- `file_size` > 10000 (più di 10KB)
- `status` = 'processing' o 'pending'
- `transcription_status` = 'pending'

### 4. Verifica in Storage

**Supabase Dashboard**:

1. Vai su **Storage → images**
2. Apri la cartella con il tuo user_id
3. Dovresti vedere il file con il nome corretto
4. Click sull'immagine: dovresti vedere l'anteprima VERA, non il quadrato verde!

---

## 🎬 Step 4: Processa l'Immagine

### Trigger Automatico

Il processing dovrebbe iniziare automaticamente dopo l'upload.

### Trigger Manuale (se necessario)

```bash
curl -X POST http://localhost:3000/api/multimedia/worker
```

### Monitora il Processing

Nella pagina Multimedia, l'immagine mostrerà:
- **"Pending"** → In attesa di processing
- **"Processing"** → Vision API in esecuzione
- **"Completed"** → Analisi completata!

Il processing può richiedere **30-60 secondi** per un'immagine.

---

## 🔍 Step 5: Verifica Risultati

### 1. Check Analisi Vision API

**SQL Query**:

```sql
SELECT 
  title,
  transcription_status,
  transcription_text,
  transcription_cost,
  LEFT(transcription_text, 200) as preview
FROM documents
WHERE media_type = 'image'
  AND transcription_status = 'completed'
ORDER BY created_at DESC
LIMIT 1;
```

Dovresti vedere:
- ✅ `transcription_status` = 'completed'
- ✅ `transcription_text` contiene l'analisi dell'immagine
- ✅ `transcription_cost` mostra il costo (es. 0.0289)

### 2. Check Chunks Creati

```sql
SELECT 
  dc.id,
  dc.chunk_index,
  LEFT(dc.text, 100) as chunk_preview,
  dc.tokens
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id
WHERE d.media_type = 'image'
ORDER BY d.created_at DESC, dc.chunk_index
LIMIT 5;
```

Dovresti vedere almeno 1 chunk con parte del testo dell'analisi.

### 3. Check nella UI

**Ricarica la pagina**:
- L'immagine ora ha badge **"Completed"** ✅
- L'anteprima mostra l'immagine reale
- Tutti i dati sono corretti

---

## 🤖 Step 6: Testa con AI Tutor

### 1. Associa l'Immagine a un Tutor

1. Vai su **Tutors**
2. Seleziona o crea un tutor
3. Vai nella sezione **Documents** del tutor
4. **Aggiungi l'immagine** processata

### 2. Fai Domande sull'Immagine

Esempi di domande:

**Per Screenshot/Testo**:
- "Che testo c'è nell'immagine?"
- "Riassumi il contenuto dell'immagine"

**Per Foto**:
- "Cosa vedi in questa immagine?"
- "Descrivi la scena"

**Per Diagrammi**:
- "Spiega questo diagramma"
- "Quali sono gli elementi principali?"

### 3. Verifica le Risposte

L'AI dovrebbe:
- ✅ Fare riferimento al contenuto dell'immagine
- ✅ Citare testi visibili
- ✅ Descrivere elementi presenti
- ✅ Rispondere basandosi sull'analisi Vision API

---

## 🐛 Troubleshooting

### Problema: L'immagine ancora non appare nella lista

**Soluzione**:
1. Hard reload (Ctrl/Cmd + Shift + R)
2. Check console browser per errori
3. Verifica che l'API restituisca dati:
   ```bash
   curl http://localhost:3000/api/multimedia?mediaType=image
   ```

### Problema: Badge "Processing" bloccato

**Soluzione**:
```bash
# Trigger manuale worker
curl -X POST http://localhost:3000/api/multimedia/worker

# Check queue status
curl http://localhost:3000/api/multimedia/worker
```

### Problema: "Failed to get image files"

**Check**:
1. Sei autenticato?
2. Check log server nel terminale
3. Verifica RLS policies nel database

### Problema: Anteprima immagine non carica

L'anteprima usa: `/api/multimedia/{id}/preview`

**Check**:
1. Verifica che questa route esista
2. Oppure modifica `getImageUrl()` in `image-files-section.tsx`

---

## 📊 Risultati Attesi

### Upload Riuscito:
```
✓ File caricato in Storage
✓ Record creato nel database
✓ Job in coda per processing
```

### Processing Completato:
```
✓ Vision API ha analizzato l'immagine
✓ Testo estratto e salvato
✓ Chunks creati
✓ Embeddings generati
✓ Immagine interrogabile da AI
```

### Costi Tipici:
- Screenshot con testo: ~$0.02
- Foto semplice: ~$0.03
- Immagine complessa: ~$0.05

---

## 🎯 Checklist Completa

- [ ] Fix API applicato (files vs documents)
- [ ] Immagini test eliminate
- [ ] Immagine reale caricata
- [ ] Immagine appare nella lista UI
- [ ] Processing completato
- [ ] Chunks e embeddings creati
- [ ] Immagine associata a tutor
- [ ] AI risponde correttamente alle domande

---

## ✅ Success Criteria

**L'implementazione è completa quando**:

1. ✅ Carichi un'immagine reale (non test)
2. ✅ L'immagine appare nella lista con anteprima corretta
3. ✅ Il processing completa in ~60 secondi
4. ✅ L'analisi Vision API è salvata nel database
5. ✅ L'AI Tutor può rispondere a domande sull'immagine

**Prova ora caricando un'immagine vera!** 🚀

