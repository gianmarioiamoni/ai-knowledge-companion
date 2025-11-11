# 🚀 Guida Deploy su Vercel - AI Knowledge Companion

## ✅ Step 1: Push Completato

Il codice è stato pushato su GitHub branch `main`. Pronto per il deploy!

---

## 📋 Step 2: Preparazione Secrets

Prima di iniziare il setup su Vercel, genera i secrets necessari:

### **Genera NEXTAUTH_SECRET**
```bash
openssl rand -base64 32
```
Output esempio: `vK3mF9pL2qR8sT4uV6wX7yZ0aB1cD2eF3gH4iJ5kL6mN7o`

### **Genera BOOTSTRAP_SECRET**
```bash
openssl rand -base64 32
```
Output esempio: `aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5c`

**💾 Salva questi valori!** Li userai nella configurazione Vercel.

---

## 🔧 Step 3: Setup Vercel (Web Interface)

### **3.1 Crea Nuovo Progetto**
1. Vai su **https://vercel.com/new**
2. Clicca **"Import Git Repository"**
3. Seleziona il repository `ai-knowledge-companion`
4. Branch: `main`
5. Framework Preset: **Next.js** (rilevato automaticamente)

### **3.2 Configura Build Settings** (già ottimali, verifica solo)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: `20.x`

### **3.3 ⚠️ NON CLICCARE ANCORA "DEPLOY"!**
Prima devi configurare le Environment Variables.

---

## 🔐 Step 4: Configura Environment Variables

Nella pagina di setup Vercel, scorri in basso fino a **"Environment Variables"** e aggiungi:

### **📊 Supabase (3 variabili)**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
> 💡 **Dove trovarle**: Supabase Dashboard → Settings → API

---

### **🤖 OpenAI (1 variabile)**
```
OPENAI_API_KEY=sk-proj-...
```
> 💡 **Dove trovarla**: OpenAI Dashboard → API Keys

---

### **🔑 NextAuth (2 variabili)**
```
NEXTAUTH_SECRET=<IL_SECRET_GENERATO_AL_PASSO_2>
NEXTAUTH_URL=https://ai-knowledge-companion.vercel.app
```
> ⚠️ **IMPORTANTE**: Dopo il primo deploy, Vercel ti darà l'URL esatto. Dovrai aggiornare `NEXTAUTH_URL` con l'URL reale.

---

### **🌐 Site URL (1 variabile)**
```
NEXT_PUBLIC_SITE_URL=https://ai-knowledge-companion.vercel.app
```
> ⚠️ **IMPORTANTE**: Usa lo stesso URL di `NEXTAUTH_URL`

---

### **🔐 Bootstrap (1 variabile)**
```
BOOTSTRAP_SECRET=<IL_BOOTSTRAP_SECRET_GENERATO_AL_PASSO_2>
```

---

### **💳 Stripe (7 variabili)**

#### **Chiavi API**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
> 💡 **Dove trovarle**: Stripe Dashboard → Developers → API Keys
> ⚠️ **Usa le chiavi LIVE, non TEST!**

#### **Price IDs** (devi crearli prima)
```
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxxxxxxxxxx
```
> 💡 **Come crearli**: Vedi sezione "Stripe Setup" più sotto

---

### **⚡ Upstash Redis (2 variabili)**
```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AabBcCdDeEf...
```
> 💡 **Dove trovarle**: Upstash Console → Your Database → REST API

---

### **📈 Analytics (Opzionali)**
```
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<auto-configurato>
NODE_ENV=production
```

---

## 🎯 Step 5: Primo Deploy

1. **Verifica** di aver inserito tutte le 18 variabili d'ambiente
2. Clicca **"Deploy"**
3. Aspetta 2-4 minuti ⏳
4. Vercel ti darà un URL tipo: `https://ai-knowledge-companion-xxx.vercel.app`

---

## 🔄 Step 6: Aggiorna URLs

Dopo il primo deploy, **devi aggiornare 2 variabili** con l'URL reale:

1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Modifica:
   - `NEXTAUTH_URL` → `https://tuo-url-reale.vercel.app`
   - `NEXT_PUBLIC_SITE_URL` → `https://tuo-url-reale.vercel.app`
3. Clicca **"Redeploy"** per applicare le modifiche

---

## 🔗 Step 7: Configura Supabase

### **7.1 Aggiungi URL a Supabase Auth**
1. Vai su **Supabase Dashboard** → Authentication → URL Configuration
2. **Site URL**: `https://tuo-url.vercel.app`
3. **Redirect URLs** (aggiungi tutte):
   ```
   https://tuo-url.vercel.app/**
   https://tuo-url.vercel.app/auth/callback
   https://tuo-url.vercel.app/api/auth/callback
   ```
4. Salva

### **7.2 Verifica RLS (Row Level Security)**
- Tutte le policy dovrebbero essere già configurate
- Verifica che le tabelle abbiano RLS abilitato

---

## 💳 Step 8: Setup Stripe

### **8.1 Crea Products e Prices** (se non fatto)

1. Vai su **Stripe Dashboard** → Products
2. Crea 3 prodotti:

#### **Starter Plan**
- Nome: `AI Knowledge Companion - Starter`
- Prezzi:
  - Monthly: `€9.99/month` → Copia Price ID in `STRIPE_PRICE_PRO_MONTHLY`
  - Yearly: `€99.99/year` → Copia Price ID in `STRIPE_PRICE_PRO_YEARLY`

#### **Pro Plan**
- Nome: `AI Knowledge Companion - Pro`
- Prezzi:
  - Monthly: `€19.99/month` → Copia Price ID in `STRIPE_PRICE_PRO_MONTHLY`
  - Yearly: `€199.99/year` → Copia Price ID in `STRIPE_PRICE_PRO_YEARLY`

#### **Enterprise Plan**
- Nome: `AI Knowledge Companion - Enterprise`
- Prezzi:
  - Monthly: `€49.99/month` → Copia Price ID in `STRIPE_PRICE_ENTERPRISE_MONTHLY`
  - Yearly: `€499.99/year` → Copia Price ID in `STRIPE_PRICE_ENTERPRISE_YEARLY`

### **8.2 Configura Webhook**

1. Vai su **Stripe Dashboard** → Developers → Webhooks
2. Clicca **"Add endpoint"**
3. **Endpoint URL**: `https://tuo-url.vercel.app/api/webhooks/stripe`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Salva e copia il **Signing secret**
6. Aggiorna `STRIPE_WEBHOOK_SECRET` su Vercel
7. Redeploy

---

## 👤 Step 9: Bootstrap Super Admin

Ora crea il primo super admin:

```bash
curl -X POST https://tuo-url.vercel.app/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Secret: IL_TUO_BOOTSTRAP_SECRET" \
  -d '{
    "email": "admin@tuodominio.com",
    "password": "SuperSecurePassword123!"
  }'
```

**Risposta attesa**:
```json
{
  "success": true,
  "message": "Super admin created successfully",
  "userId": "..."
}
```

---

## ✅ Step 10: Test Completo

### **10.1 Test Autenticazione**
1. Vai su `https://tuo-url.vercel.app/auth/login`
2. Login con le credenziali super admin
3. Verifica accesso a `/admin/dashboard`

### **10.2 Test Subscription**
1. Vai su `/plans`
2. Clicca "Subscribe" su un piano
3. Completa il flusso Stripe (usa carta test: `4242 4242 4242 4242`)
4. Verifica che l'abbonamento si attivi correttamente

### **10.3 Test Upload**
1. Vai su `/documents`
2. Carica un PDF
3. Verifica che venga processato correttamente

### **10.4 Test Chat/RAG**
1. Crea un tutor
2. Associa documenti
3. Testa una conversazione
4. Verifica che il RAG funzioni

### **10.5 Test Rate Limiting**
```bash
# Fai 10+ richieste rapide
for i in {1..15}; do
  curl -X POST https://tuo-url.vercel.app/api/chat/send \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
done
```
Dovresti ricevere `429 Too Many Requests` dopo la 10ª richiesta.

---

## 🌐 Step 11: Custom Domain (Opzionale)

### **11.1 Aggiungi Dominio**
1. Vercel Dashboard → Settings → Domains
2. Aggiungi il tuo dominio (es: `ai-companion.com`)
3. Configura DNS secondo le istruzioni Vercel

### **11.2 Aggiorna Environment Variables**
Dopo aver configurato il dominio:
```
NEXTAUTH_URL=https://ai-companion.com
NEXT_PUBLIC_SITE_URL=https://ai-companion.com
```

### **11.3 Aggiorna Supabase e Stripe**
- Supabase: Aggiungi nuovo dominio a Redirect URLs
- Stripe: Aggiungi nuovo webhook endpoint

---

## 📊 Step 12: Monitoring

### **12.1 Vercel Analytics**
- Automaticamente abilitato
- Dashboard → Analytics per vedere traffico

### **12.2 Function Logs**
- Dashboard → Logs
- Monitora errori e performance

### **12.3 Supabase Logs**
- Dashboard Supabase → Logs
- Monitora query e errori

### **12.4 Stripe Dashboard**
- Monitora subscriptions e payments
- Configura alert per pagamenti falliti

---

## 🚨 Troubleshooting

### **Errore: "NEXTAUTH_URL is required"**
- Verifica che `NEXTAUTH_URL` e `NEXT_PUBLIC_SITE_URL` siano impostati
- Redeploy dopo aver aggiunto le variabili

### **Errore: "Supabase connection failed"**
- Verifica che le chiavi Supabase siano corrette
- Controlla che l'URL Vercel sia in whitelist su Supabase

### **Webhook Stripe non funziona**
- Verifica che `STRIPE_WEBHOOK_SECRET` sia corretto
- Testa il webhook da Stripe Dashboard → Send test webhook

### **Rate Limiting non funziona**
- Verifica che Upstash Redis sia configurato
- Controlla i logs Vercel per errori Redis

---

## 🔄 Continuous Deployment

Da ora in poi, ogni push su `main` deployrà automaticamente!

```bash
# Sviluppo normale
git checkout -b feature/nuova-feature
git add .
git commit -m "feat: nuova funzionalità"
git push origin feature/nuova-feature

# Merge e deploy
git checkout main
git merge feature/nuova-feature
git push origin main  # ← Deploy automatico!
```

---

## 📚 Link Utili

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Upstash Console**: https://console.upstash.com
- **OpenAI Dashboard**: https://platform.openai.com

---

## ✅ Checklist Finale

- [ ] Push su GitHub completato
- [ ] Secrets generati (NEXTAUTH_SECRET, BOOTSTRAP_SECRET)
- [ ] Progetto Vercel creato
- [ ] 18 environment variables configurate
- [ ] Primo deploy completato
- [ ] NEXTAUTH_URL e SITE_URL aggiornati con URL reale
- [ ] Supabase redirect URLs configurati
- [ ] Stripe products e prices creati
- [ ] Stripe webhook configurato
- [ ] Super admin creato via bootstrap
- [ ] Test autenticazione ✅
- [ ] Test subscription ✅
- [ ] Test upload ✅
- [ ] Test chat/RAG ✅
- [ ] Test rate limiting ✅
- [ ] Monitoring attivo
- [ ] Custom domain configurato (opzionale)

---

## 🎉 Deploy Completato!

Congratulazioni! Il tuo AI Knowledge Companion è live su Vercel! 🚀

Per domande o problemi, controlla i logs su Vercel Dashboard o consulta la documentazione in `/docs`.

