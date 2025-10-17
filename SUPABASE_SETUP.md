# 🚀 Supabase Setup Guide

Questa guida ti aiuterà a configurare Supabase per il progetto AI Knowledge Companion, sia per lo sviluppo che per la produzione.

## 📋 Prerequisiti

- Account Supabase (gratuito su [supabase.com](https://supabase.com))
- Account OpenAI per le API
- Account Vercel per il deploy (opzionale)

## 🏗️ Setup Sviluppo

### 1. Crea Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e accedi
2. Clicca "New Project"
3. Compila i dettagli:
   - **Organization**: Scegli o crea una organization
   - **Name**: `ai-knowledge-companion`
   - **Database Password**: Genera una password sicura (salvala!)
   - **Region**: Scegli la regione più vicina (es. `Europe (Frankfurt)` per l'Europa)
4. Clicca "Create new project"
5. Aspetta che il progetto sia pronto (2-3 minuti)

### 2. Configura Database Schema

1. Nel dashboard Supabase, vai su **SQL Editor**
2. Copia e incolla il contenuto del file `supabase/schema.sql`
3. Clicca "Run" per eseguire lo script
4. Verifica che tutte le tabelle siano state create nella sezione **Table Editor**

### 3. Configura Storage

1. Vai su **Storage** nel dashboard
2. Copia e incolla il contenuto del file `supabase/storage-setup.sql` nell'SQL Editor
3. Clicca "Run" per creare il bucket e le policies

### 4. Ottieni le Chiavi API

1. Vai su **Settings** > **API**
2. Copia i seguenti valori:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ Mantieni questa chiave segreta!)

### 5. Configura Environment Variables

1. Crea il file `.env.local` nella root del progetto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

2. Sostituisci i valori con quelli reali del tuo progetto

### 6. Testa la Connessione

```bash
pnpm run dev
```

Se tutto è configurato correttamente, l'app dovrebbe avviarsi senza errori.

## 🌐 Setup Produzione (Vercel)

### 1. Prepara il Deploy

1. Assicurati che il codice sia committato su GitHub
2. Vai su [vercel.com](https://vercel.com) e accedi
3. Clicca "New Project" e seleziona il tuo repository

### 2. Configura Environment Variables in Vercel

Nel dashboard Vercel, vai su **Settings** > **Environment Variables** e aggiungi:

```bash
# Supabase (stesso progetto o crea uno separato per produzione)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Next.js
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Environment
NODE_ENV=production
```

### 3. Deploy

1. Clicca "Deploy" in Vercel
2. Aspetta che il build sia completato
3. Testa l'app in produzione

## 🔒 Sicurezza

### Variabili d'Ambiente

- ✅ **NEXT*PUBLIC*\*** - Sicure, visibili nel browser
- ⚠️ **SUPABASE_SERVICE_ROLE_KEY** - Mantieni segreta, solo server-side
- ⚠️ **OPENAI_API_KEY** - Mantieni segreta, solo server-side

### Row Level Security (RLS)

Il nostro schema include già le policies RLS per:

- ✅ Isolamento dati per utente
- ✅ Accesso controllato ai documenti
- ✅ Sicurezza storage files

### Best Practices

1. **Mai** committare file `.env.local` nel repository
   - ✅ `.env.local` è già escluso dal `.gitignore`
   - ✅ Usa `env.example` come template
   - ⚠️ Verifica sempre con `git status` prima del commit
2. Usa **service_role_key** solo per operazioni server-side
3. Implementa rate limiting per le API
4. Monitora l'uso delle API OpenAI
5. **Rotazione chiavi**: Cambia le API keys periodicamente
6. **Ambiente separato**: Usa progetti Supabase diversi per dev/prod

## 🧪 Testing

### Test Connessione Database

```bash
# Nel browser, apri Developer Tools e vai su Network
# Naviga nell'app e verifica le chiamate a Supabase
```

### Test Storage

```bash
# Carica un file nella sezione Documents
# Verifica che appaia nel bucket Supabase Storage
```

### Test Autenticazione

```bash
# Registra un nuovo utente
# Verifica che appaia nella tabella auth.users in Supabase
```

## 🆘 Troubleshooting

### Errore: "Missing Supabase environment variables"

- Verifica che `.env.local` esista e contenga le variabili corrette
- Riavvia il server di sviluppo dopo aver aggiunto le variabili

### Errore: "Invalid API key"

- Verifica che le chiavi Supabase siano corrette
- Assicurati di usare le chiavi del progetto giusto

### Errore: "Row Level Security policy violation"

- Verifica che l'utente sia autenticato
- Controlla che le RLS policies siano configurate correttamente

### Errore di CORS

- Verifica che il dominio sia configurato in Supabase **Authentication** > **URL Configuration**

## 📚 Risorse Utili

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)

## 🎯 Prossimi Passi

Dopo aver completato il setup:

1. ✅ Testa l'autenticazione
2. ✅ Testa l'upload di documenti
3. ✅ Configura OpenAI per gli embeddings
4. ✅ Implementa la pipeline RAG completa
5. ✅ Deploy in produzione

---

**Hai bisogno di aiuto?** Controlla la sezione Troubleshooting o consulta la documentazione Supabase.
