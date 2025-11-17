# 📖 AI Knowledge Companion - Manuale Utente

**Versione**: 1.0  
**Data**: Novembre 2025  
**Lingue Supportate**: 🇬🇧 English, 🇮🇹 Italiano

---

## 📑 Indice

1. [Introduzione](#introduzione)
2. [Primi Passi](#primi-passi)
3. [Gestione Documenti](#gestione-documenti)
4. [File Multimediali](#file-multimediali)
5. [Creazione Tutor AI](#creazione-tutor-ai)
6. [Chat con i Tutor](#chat-con-i-tutor)
7. [Marketplace](#marketplace)
8. [Piani e Abbonamenti](#piani-e-abbonamenti)
9. [Monitoraggio Utilizzo](#monitoraggio-utilizzo)
10. [Profilo e Impostazioni](#profilo-e-impostazioni)
11. [Funzioni Admin](#funzioni-admin-super-admin)
12. [FAQ](#faq)

---

## 🎯 Introduzione

**AI Knowledge Companion** è una piattaforma che ti permette di:
- 📄 Caricare e gestire documenti (PDF, DOCX, PPTX, TXT)
- 🎬 Processare file multimediali (audio, video, immagini)
- 🤖 Creare AI Tutor personalizzati alimentati dai tuoi contenuti
- 💬 Chattare con i tutor usando tecnologia RAG (Retrieval-Augmented Generation)
- 🏪 Condividere tutor nel Marketplace
- 📊 Monitorare l'utilizzo e i costi API

---

## 🚀 Primi Passi

### 1. Registrazione

1. Vai su **`/signup`**
2. Scegli tra:
   - **Email/Password**: Compila il form e conferma l'email
   - **Google Sign-Up**: Accesso rapido con account Google
3. Ricevi automaticamente il **Piano Trial** (30 giorni gratuiti)

### 2. Login

1. Vai su **`/login`**
2. Accedi con:
   - Email e Password
   - Google Sign-In
3. Verrai reindirizzato alla **Dashboard**

### 3. Dashboard

**Accesso**: Menu principale → **Dashboard**

La Dashboard mostra:
- 📊 **Statistiche**: Numero di tutor, documenti, conversazioni
- 🤖 **Tutor Recenti**: Ultimi tutor creati
- 📄 **Documenti Recenti**: Ultimi documenti caricati
- ⚡ **Azioni Rapide**: Crea tutor, carica documento, nuova chat

---

## 📄 Gestione Documenti

### Caricare un Documento

**Accesso**: Menu → **Storage** → **Documents**

1. Clicca su **"Upload Document"**
2. Seleziona file:
   - **PDF** (fino a 10MB)
   - **DOCX** (Word)
   - **PPTX** (PowerPoint)
   - **TXT** (testo)
3. Clicca **"Upload"**
4. Il documento viene:
   - ✅ Caricato su Supabase Storage
   - ✂️ Suddiviso in chunks
   - 🧠 Processato per embeddings (automatico)
   - ✅ Pronto per essere usato dai tutor

### Gestire Documenti

**Nella pagina Documents**:
- 🔍 **Ricerca**: Filtra documenti per nome
- 👁️ **Visualizza**: Vedi anteprima e dettagli
- 🔗 **Collega**: Associa a un tutor
- 🗑️ **Elimina**: Rimuovi documento (disassocia prima dai tutor)

### Link Documento-Tutor

1. Apri un documento
2. Clicca **"Link to Tutor"**
3. Seleziona uno o più tutor
4. Conferma
5. Il tutor può ora rispondere usando questo documento

---

## 🎬 File Multimediali

### Tipi Supportati

**Accesso**: Menu → **Storage** → **Multimedia**

- **🎵 Audio**: MP3, WAV, M4A (max 25MB)
- **🎥 Video**: MP4, MOV, AVI (max 100MB)
- **🖼️ Immagini**: JPG, PNG, GIF, WebP (max 5MB)

### Caricare File Multimediali

1. Vai su **Multimedia**
2. Scegli tipo:
   - **Upload Audio**
   - **Upload Video**
   - **Upload Image**
3. Seleziona file
4. Clicca **"Upload"**

### Processamento Automatico

**Audio/Video**:
1. ✅ Upload su Supabase Storage
2. 🎤 Trascrizione automatica (Whisper API)
3. ✂️ Chunking del testo
4. 🧠 Generazione embeddings
5. ✅ Pronto per RAG

**Immagini**:
1. ✅ Upload su Supabase Storage
2. 👁️ Analisi con Vision API (GPT-4V)
3. 📝 Descrizione generata
4. 🧠 Embeddings per ricerca semantica

### Gestire File Multimediali

- 🔍 **Ricerca**: Filtra per nome o tipo
- 👁️ **Visualizza**: Anteprima e trascrizione (audio/video)
- 🔗 **Collega**: Associa a tutor (come i documenti)
- 🗑️ **Elimina**: Rimuovi file

---

## 🤖 Creazione Tutor AI

### Creare un Nuovo Tutor

**Accesso**: Menu → **Tutors** → **"Create New Tutor"**

#### Step 1: Informazioni Base

- **Nome**: Nome del tutor (es. "Esperto Python")
- **Descrizione**: Cosa fa il tutor
- **Istruzioni**: Prompt di sistema (personalità, comportamento)
- **Visibilità**:
  - 🔒 **Private**: Solo tu
  - 🔗 **Unlisted**: Chi ha il link
  - 🌐 **Public**: Tutti (visibile nel Marketplace)

#### Step 2: Configurazione AI

- **Modello**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Temperatura**: 0.0 (preciso) - 1.0 (creativo)
- **Max Tokens**: Limite risposta (default: 2000)
- **Top P**: Sampling (default: 1.0)

#### Step 3: RAG Configuration

- **Abilitato**: On/Off
- **Chunk Limit**: Quanti chunks usare (default: 5)
- **Similarity Threshold**: Soglia similarità (0.0-1.0)

#### Step 4: Documenti

- Seleziona documenti da collegare
- Puoi collegare anche dopo la creazione

### Modificare un Tutor

1. Vai su **Tutors**
2. Clicca sul tutor
3. Clicca **"Edit"**
4. Modifica campi
5. **Save Changes**

### Eliminare un Tutor

1. Vai su **Tutors**
2. Clicca sul tutor
3. Clicca **"Delete"**
4. Conferma

⚠️ **Attenzione**: Elimina anche tutte le conversazioni associate!

---

## 💬 Chat con i Tutor

### Avviare una Chat

**Opzione 1**: Dalla pagina Tutors
1. Clicca su un tutor
2. Clicca **"Start Chat"**

**Opzione 2**: Dal menu
1. Menu → **Chat**
2. Seleziona tutor dalla sidebar
3. Inizia a chattare

### Interfaccia Chat

**Sidebar (sinistra)**:
- 🔍 Cerca conversazioni
- 📋 Lista conversazioni
- ➕ Nuova conversazione

**Area principale**:
- 💬 Messaggi
- 📝 Input text
- 🎤 Voice input (se abilitato)
- 📎 Allega file

**Header**:
- 🤖 Nome tutor
- ⚙️ Impostazioni conversazione
- 🗑️ Elimina conversazione

### Funzionalità Chat

#### Messaggi
- **Testo**: Scrivi e invia
- **Multilinea**: Shift+Enter per nuova riga
- **Markdown**: Supportato nelle risposte

#### RAG (se abilitato)
- Il tutor cerca nei documenti collegati
- Mostra chunks rilevanti
- Cita le fonti

#### Conversazioni
- **Multipre**: Più conversazioni per tutor
- **Storico**: Tutte salvate
- **Ricerca**: Trova vecchie chat
- **Elimina**: Rimuovi conversazioni

---

## 🏪 Marketplace

**Accesso**: Menu → **Marketplace**

### Cos'è il Marketplace

Piattaforma per:
- 🔍 **Scoprire**: Tutor pubblici creati da altri utenti
- 📥 **Usare**: Chatta con tutor del marketplace
- 📤 **Condividere**: Pubblica i tuoi tutor

### Usare un Tutor del Marketplace

1. Vai su **Marketplace**
2. Sfoglia o cerca tutor
3. Clicca su un tutor per dettagli
4. Clicca **"Start Chat"** o **"Use This Tutor"**
5. Inizia a chattare

### Pubblicare un Tutor

1. Crea un tutor
2. Imposta **Visibilità**: **Public**
3. Salva
4. Il tutor appare nel Marketplace

⚠️ **Nota**: Solo tutor pubblici sono visibili nel Marketplace

---

## 💳 Piani e Abbonamenti

**Accesso**: Menu → **Plans**

### Piani Disponibili

| Piano | Prezzo | API Calls | Tokens | Cost Limit |
|-------|--------|-----------|--------|------------|
| **Trial** | €0/mese (30 giorni) | 100 | 50,000 | €5 |
| **Starter** | €9/mese | 1,000 | 500,000 | €20 |
| **Pro** | €29/mese | 10,000 | 2,000,000 | €100 |
| **Enterprise** | €99/mese | 100,000 | 10,000,000 | €500 |

### Cambiare Piano

#### Upgrade

1. Vai su **Plans**
2. Seleziona piano superiore
3. Clicca **"Subscribe"**
4. Completa pagamento Stripe
5. Attivazione immediata
6. **Proration**: Credito per giorni non usati del piano precedente

#### Downgrade

1. Vai su **Plans**
2. Seleziona piano inferiore
3. Clicca **"Subscribe"**
4. **Cambio Posticipato**: Attivo dal prossimo ciclo di fatturazione
5. Vedi banner con data cambio

### Cancellare Abbonamento

1. Vai su **Plans**
2. Clicca **"Cancel Subscription"**
3. Conferma
4. Accesso fino alla fine del periodo pagato
5. Poi passa automaticamente a Trial (se disponibile)

### Storico Pagamenti

1. Menu profilo → **Usage** → Sezione "Billing History"
2. Vedi tutte le transazioni Stripe

---

## 📊 Monitoraggio Utilizzo

**Accesso**: Menu profilo → **Usage**

### Dashboard Utilizzo

Mostra:

#### 1. API Calls
- **Current**: Chiamate API correnti
- **Max**: Limite mensile
- **Progress Bar**: Visualizzazione % utilizzo
- **Color Coding**:
  - 🟢 Verde: 0-60%
  - 🟡 Giallo: 61-80%
  - 🔴 Rosso: 81-100%

#### 2. Tokens
- **Current**: Token consumati
- **Max**: Limite mensile
- **Progress Bar**: % utilizzo

#### 3. Cost (💰 Costo API)
- **Current**: Costo effettivo API OpenAI
- **Max**: Budget mensile
- **Progress Bar**: % spesa
- **Include**:
  - Chat completions (GPT-4, GPT-3.5)
  - Embeddings (documenti, multimedia)
  - Transcription (Whisper)
  - Vision (GPT-4V)

#### 4. Last 30 Days Summary
- Total API Calls
- Total Tokens
- **Total Cost**

#### 5. Alerts
- ⚠️ Warning se ti avvicini ai limiti (>80%)
- 🚨 Critical se superi i limiti

#### 6. Reset Date
- Data di reset della quota (inizio nuovo ciclo)

### Cosa Viene Tracciato

**Chat Operations**:
- Chat completions (token input/output)
- RAG embeddings per similarity search

**Multimedia Processing**:
- Audio/Video transcription (Whisper API)
- Audio/Video embeddings
- Image analysis (Vision API)
- Image embeddings

**Document Processing**:
- Document embeddings (chunking + embeddings)

### Quota Exceeded

Se superi i limiti:
1. Ricevi alert nella dashboard
2. Alcune operazioni potrebbero essere bloccate
3. **Soluzione**:
   - Upgrade piano
   - Aspetta reset mensile

---

## 👤 Profilo e Impostazioni

### Profilo Utente

**Accesso**: Menu profilo (in alto a destra) → **Profile**

**Informazioni**:
- 📧 Email
- 👤 Display Name
- 📅 Data registrazione
- 🎫 Piano corrente
- 🔑 Ruolo (user, admin, super_admin)

**Azioni**:
- ✏️ **Modifica Profilo**: Cambia nome, email
- 🔒 **Cambia Password**: Solo per account email/password
- 🗑️ **Elimina Account**: Rimuovi account (irreversibile)

### Impostazioni

**Lingua**:
- Clicca sull'icona lingua (🌐)
- Scegli tra English 🇬🇧 e Italiano 🇮🇹
- Interfaccia cambia immediatamente

**Cookie Consent**:
- Banner al primo accesso
- Gestisci preferenze cookie
- Categorie: Necessary, Analytics, Preferences, Marketing

---

## 🔐 Funzioni Admin (Super Admin)

**Accesso**: Menu → **Admin** (solo per admin/super_admin)

### Admin Dashboard

**Path**: `/admin/dashboard`

**Mostra**:
- 📊 **System Stats**: Utenti totali, tutors, documenti
- 💰 **Billing Overview**: Costi totali, revenue
- 📈 **Top Users**: Utenti con maggior utilizzo
- 🔔 **Alerts**: Notifiche sistema

### Gestione Utenti

**Path**: `/admin/users`

**Funzionalità**:
- 📋 **Lista Utenti**: Tutti gli utenti registrati
- 🔍 **Ricerca**: Filtra per email, nome, ruolo, status
- 👁️ **Visualizza**: Dettagli utente
- ✏️ **Modifica**:
  - Cambia ruolo (user, admin, super_admin)
  - Cambia status (active, suspended, banned)
  - Esenta da abbonamento (subscription_exempt)
- 🗑️ **Elimina**: Rimuovi utente (soft delete)

**Ruoli**:
- **user**: Utente normale
- **admin**: Accesso dashboard admin, gestione utenti
- **super_admin**: Accesso completo, incluso Usage di tutti

**Status**:
- **active**: Utente attivo
- **suspended**: Sospeso temporaneamente
- **banned**: Bannato (no accesso)

### Billing Admin

**Path**: `/admin/billing`

**Mostra**:
- 💰 **Total Revenue**: Entrate totali
- 📊 **Costs Overview**: Costi API totali
- 👥 **Top Users by Cost**: Utenti con maggior spesa API
- 📈 **Trend**: Andamento nel tempo
- 🔔 **Alerts**: Utenti che superano limiti

**Funzionalità**:
- Filtra per periodo (day, week, month, year)
- Esporta report (CSV)
- Visualizza dettagli per utente

### Usage di Tutti gli Utenti

**Path**: `/admin/usage` (solo super_admin)

**Mostra**:
- 👥 **Total Users**: Utenti totali (+ attivi)
- 📞 **Total API Calls**: Somma di tutte le chiamate
- 🔢 **Total Tokens**: Somma di tutti i token
- 💰 **Total Cost**: Costo API totale
- 📊 **Avg Cost/User**: Media per utente

**Lista Utenti**:
- Email, ruolo, status
- Current usage (API calls, tokens, cost)
- Max limits
- Progress bars (visive)
- Last 30 days stats

**Sort**:
- Per Cost (default)
- Per Tokens
- Per API Calls

---

## ❓ FAQ

### Account e Autenticazione

**Q: Posso cambiare email?**  
A: Sì, vai su Profile → Edit Profile → Cambia email → Conferma nuovo indirizzo.

**Q: Ho dimenticato la password?**  
A: Clicca "Forgot Password?" nella pagina di login → Inserisci email → Ricevi link reset.

**Q: Posso usare Google e Email/Password insieme?**  
A: No, scegli un metodo alla registrazione. Se hai registrato con email, non puoi poi usare Google per lo stesso account.

### Piani e Pagamenti

**Q: Cosa succede dopo il Trial?**  
A: Devi scegliere un piano a pagamento o perdi l'accesso alle funzioni premium. Puoi comunque accedere al tuo account.

**Q: Posso cancellare in qualsiasi momento?**  
A: Sì, cancellazione istantanea. Accesso fino alla fine del periodo pagato.

**Q: Cosa include la proration?**  
A: Quando fai upgrade, ricevi un credito proporzionale per i giorni non usati del piano precedente, applicato subito al nuovo piano.

**Q: Accettate PayPal?**  
A: Al momento solo carte di credito/debito tramite Stripe.

### Documenti e Multimedia

**Q: Posso caricare PDF scansionati?**  
A: Sì, ma l'estrazione del testo potrebbe essere limitata. Per migliori risultati, usa PDF testuali.

**Q: I file vengono cancellati automaticamente?**  
A: No, rimangono fino a quando non li elimini manualmente.

**Q: Posso ri-processare un documento?**  
A: No, il processamento è automatico all'upload. Se necessario, elimina e ricarica.

**Q: Quanti documenti posso caricare?**  
A: Dipende dal piano. Il limite è in termini di costo di processamento (embeddings), non numero di file.

### Tutor AI

**Q: Quanti tutor posso creare?**  
A: Nessun limite fisso, ma ogni tutor consuma quota per embeddings dei documenti collegati.

**Q: Posso condividere un tutor privato?**  
A: Sì, imposta "Unlisted" e condividi il link diretto.

**Q: Posso trasferire un tutor a un altro utente?**  
A: No, al momento non è possibile. L'utente deve ricrearlo.

### Chat e Conversazioni

**Q: Le chat sono salvate?**  
A: Sì, tutte le conversazioni sono salvate e accessibili in qualsiasi momento.

**Q: Posso esportare le chat?**  
A: Non direttamente dall'interfaccia. Contatta il supporto per esportazioni massive.

**Q: Il tutor può "dimenticare" informazioni?**  
A: No, il contesto RAG è sempre disponibile. Ma il contesto della conversazione ha un limite (token max).

### Utilizzo e Costi

**Q: Perché il mio costo è alto?**  
A: Dipende da:
- Modello usato (GPT-4 costa di più)
- Lunghezza delle risposte (max tokens)
- Numero di documenti (embeddings)
- Numero di multimedia processati

**Suggerimenti per ridurre costi**:
- Usa GPT-3.5 quando possibile
- Riduci max_tokens
- Limita il numero di chunk RAG
- Evita di riprocessare gli stessi file

**Q: Quando si resetta la quota?**  
A: All'inizio di ogni ciclo di fatturazione mensile (vedi data su Usage dashboard).

### Marketplace

**Q: I tutor del Marketplace sono gratuiti?**  
A: L'uso del tutor sì, ma consumi la tua quota API. Il creatore non guadagna (al momento).

**Q: Posso vendere i miei tutor?**  
A: No, al momento il Marketplace è solo per condivisione gratuita.

### Sicurezza e Privacy

**Q: I miei dati sono al sicuro?**  
A: Sì, usiamo:
- Encryption at rest (Supabase)
- HTTPS/TLS
- RLS (Row Level Security)
- JWT authentication
- Rate limiting

**Q: Cancellate i miei dati se elimino l'account?**  
A: Sì, eliminazione completa (hard delete) di tutti i dati entro 30 giorni.

**Q: Usate i miei dati per addestrare AI?**  
A: No, i tuoi dati NON sono usati per training. Vedi Privacy Policy.

### Supporto

**Q: Come contatto il supporto?**  
A: Menu → **Contact** → Compila form → Ricevi conferma email.

**Q: Tempi di risposta?**  
A: Solitamente entro 2 giorni lavorativi.

**Q: C'è documentazione tecnica?**  
A: Sì, vedi `/docs` nel repository GitHub.

---

## 📞 Supporto e Contatti

**Email**: support@aiknowledgecompanion.com  
**Form Contatti**: `/contact`  
**Documentazione**: [docs/](../docs/)  
**GitHub**: [Repository](https://github.com/your-repo)

---

## 📝 Note Legali

- 📄 [Privacy Policy](/privacy-policy)
- 📜 [Terms of Service](/terms-of-service)
- 🍪 [Cookie Policy](/cookie-policy)

---

## 🔄 Changelog

**v1.0** (Novembre 2025)
- ✅ Prima versione completa manuale utente
- ✅ Copertura tutte le funzionalità
- ✅ FAQ estese
- ✅ Supporto EN/IT

---

**Fine del Manuale Utente**  
_Ultimo aggiornamento: Novembre 2025_

