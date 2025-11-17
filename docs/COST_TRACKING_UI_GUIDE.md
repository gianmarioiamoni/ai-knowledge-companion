# 📊 Cost Tracking - Guida UI

Come visualizzare i dati di cost tracking nell'interfaccia utente.

---

## 🎯 Accesso alla Dashboard di Utilizzo

### Desktop
1. Fai login all'applicazione
2. Nel menu principale in alto, clicca su **"Usage"** (o **"Utilizzo"** in italiano)
3. Sarai portato alla pagina `/billing` con il dashboard completo

### Mobile
1. Fai login all'applicazione
2. Apri il menu mobile (icona hamburger)
3. Clicca su **"Usage"** (icona Activity 📊)
4. Sarai portato alla pagina `/billing` con il dashboard completo

### Accesso Diretto
Puoi anche andare direttamente su:
- **Inglese**: `http://localhost:3000/en/billing`
- **Italiano**: `http://localhost:3000/it/billing`
- **Produzione**: `https://your-domain.com/en/billing`

---

## 📱 Cosa Vedrai nella Dashboard

### 1️⃣ **API Calls Card**
```
┌─────────────────────────────┐
│ 💬 API Calls                │
│ 1,234 / 50,000              │
│ ▓▓░░░░░░░░░░░░░░░░░░ 2.5%   │
│ 2.5% used                   │
└─────────────────────────────┘
```
- **Mostra**: Numero di chiamate API effettuate vs limite mensile
- **Progress Bar**: Barra di progresso visiva
- **Percentuale**: Percentuale di utilizzo

### 2️⃣ **Tokens Card**
```
┌─────────────────────────────┐
│ 💻 Tokens                   │
│ 45,678 / 1,000,000          │
│ ▓▓▓░░░░░░░░░░░░░░░░░ 4.6%   │
│ 4.6% used                   │
└─────────────────────────────┘
```
- **Mostra**: Token OpenAI consumati vs limite mensile
- **Include**: Chat, embeddings, transcription, vision
- **Progress Bar**: Barra di progresso visiva

### 3️⃣ **💰 Cost Card** ← **COST TRACKING!**
```
┌─────────────────────────────┐
│ 💵 Cost                     │
│ $2.34 / $50.00              │
│ ▓▓▓░░░░░░░░░░░░░░░░░ 4.7%   │
│ 4.7% used                   │
└─────────────────────────────┘
```
- **Mostra**: Costo effettivo delle chiamate OpenAI vs budget mensile
- **Calcolo**: Basato su costi reali di API (embeddings, chat, etc.)
- **Aggiornamento**: In tempo reale ad ogni operazione

### 4️⃣ **Last 30 Days Summary**
```
┌─────────────────────────────────────────────┐
│ Last 30 Days Summary                        │
├─────────────────────────────────────────────┤
│   12,345          456,789         $23.45    │
│   Total Calls     Total Tokens    Total Cost│
└─────────────────────────────────────────────┘
```
- **Mostra**: Statistiche aggregate degli ultimi 30 giorni
- **Include**: Tutte le operazioni (chat, embeddings, transcription)

### 5️⃣ **Alerts Section** (se presenti)
```
┌─────────────────────────────────────────────┐
│ ⚠️  COST                                    │
│ You've exceeded 80% of your monthly cost    │
│ limit. Consider upgrading your plan.        │
└─────────────────────────────────────────────┘
```
- **Mostra**: Avvisi se ti stai avvicinando ai limiti
- **Tipi**: Cost alerts, token alerts, API call alerts
- **Colori**: Rosso per avvisi critici, giallo per warning

### 6️⃣ **Reset Information**
```
┌─────────────────────────────────────────────┐
│ Your quota will reset on 12/01/2025         │
└─────────────────────────────────────────────┘
```
- **Mostra**: Data del prossimo reset della quota
- **Ciclo**: Basato sul billing cycle (mensile)

---

## 🎨 Design e UX

### Colori Progress Bar
- **Verde**: 0-60% utilizzo
- **Giallo**: 61-80% utilizzo
- **Rosso**: 81-100+ utilizzo

### Responsiveness
- **Desktop**: 3 card affiancate (API, Tokens, Cost)
- **Tablet**: 2 card per riga
- **Mobile**: 1 card per riga (stack verticale)

### Aggiornamenti
- **Real-time**: I dati si aggiornano automaticamente dopo ogni operazione
- **Refresh**: Puoi ricaricare la pagina per vedere i dati più recenti
- **Cache**: I dati sono cached per 30 secondi per performance

---

## 📊 Dati Tracciati nel Cost

Il **Cost** visualizzato include tutte queste operazioni:

### Chat Operations
- ✅ **Chat completions**: GPT-4, GPT-3.5 (basato su token input/output)
- ✅ **RAG queries**: Embeddings per similarity search
- ✅ **Context embedding**: Generazione embeddings per contesto

### Multimedia Processing
- ✅ **Audio transcription**: Whisper API (basato su durata audio)
- ✅ **Audio embeddings**: Text-to-embedding per trascrizioni
- ✅ **Image analysis**: Vision API (GPT-4 Vision)
- ✅ **Image embeddings**: Text-to-embedding per descrizioni immagini
- ✅ **Video processing**: Transcription + Vision + embeddings

### Document Processing
- ✅ **Document embeddings**: Text-to-embedding per chunks documento
- ✅ **Document chunking**: Preprocessing e text extraction

---

## 🧮 Come Viene Calcolato il Cost

### Esempio: Upload Audio

**Step 1: Transcription (Whisper API)**
```
Audio: 60 secondi
Cost: $0.006 per minute
Calcolo: (60/60) * $0.006 = $0.006
```

**Step 2: Chunking**
```
Trascrizione: 250 parole
Chunks creati: 3 chunks
Cost chunking: $0 (locale)
```

**Step 3: Embeddings (text-embedding-3-small)**
```
Token totali: 245 tokens
Cost: $0.00002 per 1K tokens
Calcolo: (245 / 1000) * $0.00002 = $0.0000049
```

**Step 4: Total Cost**
```
Transcription: $0.0060
Embeddings:    $0.0000049
─────────────────────────
Total:         $0.0060049 ≈ $0.0060
```

### Questo Viene Salvato in:
- **billing_tracking**: Record con `cost_estimate: 0.0060`
- **user_quotas**: `current_cost` incrementato di `0.0060`
- **Dashboard UI**: Visualizzato nella Cost Card

---

## 🔍 Verifica Database vs UI

### Database Query
```sql
SELECT 
  current_api_calls,
  current_tokens,
  current_cost,
  max_api_calls_per_month,
  max_tokens_per_month,
  max_cost_per_month
FROM user_quotas
WHERE user_id = auth.uid();
```

### UI Dashboard
Mostra esattamente gli stessi valori:
- `current_api_calls` → API Calls card
- `current_tokens` → Tokens card
- `current_cost` → Cost card
- `max_*` → Limiti visualizzati in ogni card

---

## 🚨 Troubleshooting UI

### "No usage data available"
**Cause**: Quota non inizializzata per l'utente
**Fix**:
```sql
SELECT * FROM get_or_create_user_quota(auth.uid());
```

### "Loading usage data..." infinito
**Cause**: Errore di fetch dai backend
**Fix**:
1. Apri Dev Tools (F12) → Console
2. Guarda errori API
3. Verifica che `/api/billing/quota` risponda

### Cost non si aggiorna
**Cause**: Cache del browser o della query
**Fix**:
1. Ricarica la pagina (F5)
2. Aspetta 30 secondi (cache SWR)
3. Verifica database con query SQL

### Progress bar non corretta
**Cause**: Percentuale calcolata male
**Fix**: Verifica che `max_cost_per_month > 0` nel database

---

## 📚 File Sorgenti

### UI Components
- **Dashboard**: `src/components/billing/usage-dashboard.tsx`
- **Page**: `src/app/[locale]/billing/page.tsx`
- **Client Page**: `src/components/billing/pages/billing-page-client.tsx`

### Hooks
- **useBilling**: `src/hooks/use-billing.ts`

### Backend
- **Quota API**: `src/app/api/billing/quota/route.ts`
- **Summary API**: `src/app/api/billing/summary/route.ts`
- **Alerts API**: `src/app/api/billing/alerts/route.ts`

### Database
- **Table**: `user_quotas`
- **Function**: `log_usage_and_check_quota()`
- **View**: Nessuna (query diretta)

---

## ✅ Checklist UI Completa

- [x] Dashboard di utilizzo implementata
- [x] Cost tracking visualizzato nella UI
- [x] Progress bar per API calls, tokens, cost
- [x] Summary ultimi 30 giorni
- [x] Alerts per quota exceeded
- [x] Data di reset quota
- [x] Link nel menu desktop
- [x] Link nel menu mobile
- [x] Traduzioni EN/IT complete
- [x] Responsiveness mobile/tablet/desktop
- [x] Real-time updates
- [x] Error handling

---

## 🎉 Risultato

Ora gli utenti possono:

1. ✅ Vedere in tempo reale quanto stanno spendendo in API OpenAI
2. ✅ Monitorare l'utilizzo di API calls e tokens
3. ✅ Ricevere alert quando si avvicinano ai limiti
4. ✅ Vedere lo storico degli ultimi 30 giorni
5. ✅ Sapere quando la quota si resetterà
6. ✅ Accedere facilmente dal menu principale

**Il Cost Tracking è ora completamente visibile e accessibile nell'UI!** 🎯

