# ✅ Stripe Live Mode - Checklist Rapida

Quick checklist per attivare Stripe in produzione con la tua struttura esistente.

---

## 📋 Prodotti da Creare in Live Mode

### **Prodotto 1: AI Knowledge Companion - Pro**

1. **Stripe Dashboard** → Passa a **Live Mode** (toggle in alto a sinistra)
2. **Products** → **Add Product**
3. **Compila**:
   - **Name**: `AI Knowledge Companion - Pro`
   - **Description**: `Advanced features for power users`
   - **Tax category**: `General - Electronically Supplied Services`

4. **Aggiungi Primo Prezzo (Mensile)**:
   - **Pricing model**: `Standard pricing`
   - **Price**: `€19.00`
   - **Billing period**: `Monthly`
   - ✅ Set as default
   - **Save**
   - 📋 **COPIA IL PRICE ID**: `price_live_xxxxxxxxxxxxx` → Salvalo come `PRO_MONTHLY`

5. **Aggiungi Secondo Prezzo (Annuale)**:
   - Clicca sul prodotto appena creato
   - **Add another price**
   - **Price**: `€190.00`
   - **Billing period**: `Yearly`
   - **Save**
   - 📋 **COPIA IL PRICE ID**: `price_live_xxxxxxxxxxxxx` → Salvalo come `PRO_YEARLY`

---

### **Prodotto 2: AI Knowledge Companion - Enterprise**

1. **Products** → **Add Product**
2. **Compila**:
   - **Name**: `AI Knowledge Companion - Enterprise`
   - **Description**: `Full features with priority support and advanced capabilities`
   - **Tax category**: `General - Electronically Supplied Services`

3. **Aggiungi Primo Prezzo (Mensile)**:
   - **Pricing model**: `Standard pricing`
   - **Price**: `€49.00`
   - **Billing period**: `Monthly`
   - ✅ Set as default
   - **Save**
   - 📋 **COPIA IL PRICE ID**: `price_live_xxxxxxxxxxxxx` → Salvalo come `ENTERPRISE_MONTHLY`

4. **Aggiungi Secondo Prezzo (Annuale)**:
   - Clicca sul prodotto appena creato
   - **Add another price**
   - **Price**: `€490.00`
   - **Billing period**: `Yearly`
   - **Save**
   - 📋 **COPIA IL PRICE ID**: `price_live_xxxxxxxxxxxxx` → Salvalo come `ENTERPRISE_YEARLY`

---

## 🔑 Price IDs da Copiare

Dopo aver creato i prodotti, avrai 4 Price IDs da inserire in Vercel:

```bash
# PRO PLAN
STRIPE_PRICE_PRO_MONTHLY=price_live_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_live_xxxxxxxxxxxxx

# ENTERPRISE PLAN
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_live_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_live_xxxxxxxxxxxxx
```

---

## 🔑 Chiavi API Live Mode

### **Opzione A: Restricted Key (🔐 Raccomandato per Production)**

1. **Developers** → **API keys** (in **Live mode**)
2. Click **+ Create restricted key**
3. **Permissions** (vedi [guida dettagliata](./STRIPE_RESTRICTED_KEY_SETUP.md)):
   - ✅ Write: Checkout Sessions, Customers, Subscriptions, Portal Sessions
   - ✅ Read: Products, Prices, Payment Intents, Invoices, Events
4. **Copia**:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx  # ← Restricted key
   ```

### **Opzione B: Standard Key (⚠️ Non Raccomandato)**

1. **Developers** → **API keys** (in **Live mode**)
2. Usa la **Secret key** già generata
3. ⚠️ **Rischio**: Accesso completo a tutte le API

**📖 Guida Completa**: [STRIPE_RESTRICTED_KEY_SETUP.md](./STRIPE_RESTRICTED_KEY_SETUP.md)

---

## 🪝 Webhook Live Mode

1. **Developers** → **Webhooks** (in **Live mode**)
2. **Add endpoint**:
   ```
   https://ai-knowledge-companion.vercel.app/api/webhooks/stripe
   ```
3. **Seleziona eventi**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.created`
   - ✅ `customer.updated`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

4. **Save** → **Copia Signing Secret**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

---

## 🌐 Vercel Environment Variables

### **Step 1: Rimuovi variabili di test** (se presenti)

1. **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. **Cerca e rimuovi** (se esistono):
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test)
   - `STRIPE_SECRET_KEY` (test)
   - `STRIPE_WEBHOOK_SECRET` (test)
   - Qualsiasi `STRIPE_PRICE_*` (test)

### **Step 2: Aggiungi variabili di produzione**

Aggiungi le seguenti variabili selezionando **SOLO "Production"** environment:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_live_...` (Pro €19) | Production |
| `STRIPE_PRICE_PRO_YEARLY` | `price_live_...` (Pro €190) | Production |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | `price_live_...` (Enterprise €49) | Production |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | `price_live_...` (Enterprise €490) | Production |

⚠️ **IMPORTANTE**: 
- Seleziona **SOLO "Production"** (NON Preview/Development)
- Verifica che ogni variabile mostri "Production" nella colonna "Environment"

---

## 🚀 Deploy

### **Opzione A: Auto-deploy da Git**
```bash
cd /Users/gianmarioiamoni/PROGRAMMAZIONE/Projects/ai-knowledge-companion
git commit --allow-empty -m "chore: activate Stripe live mode"
git push
```

### **Opzione B: Manual Redeploy**
1. **Vercel Dashboard** → **Deployments**
2. Clicca **"..."** sull'ultimo deployment
3. **Redeploy**
4. Attendi 2-3 minuti

---

## 🧪 Testing Live Mode

⚠️ **Questo creerà addebiti REALI!**

### **Test 1: Verifica Banner Nascosto**
1. Vai su: `https://ai-knowledge-companion.vercel.app/en/plans`
2. **Verifica**:
   - ❌ Banner giallo "Test Mode" **NON** è visibile
   - ✅ Prezzi corretti: Pro €19/€190, Enterprise €49/€490
   - ✅ Toggle mensile/annuale funziona

### **Test 2: Test Checkout (Piccolo Importo)**
1. **Seleziona Pro Plan Mensile** (€19)
2. **Clicca "Select Plan"**
3. **Verifica Stripe Checkout**:
   - 🔵 Pagina di checkout **BLU** (non arancione)
   - ✅ Mostra "€19.00/month"
   - ✅ Logo "Stripe" (non "Test Mode")

4. **Completa Pagamento**:
   - Usa la tua carta reale
   - Compila email, carta, CVV
   - **Pay**

5. **Verifica Successo**:
   - ✅ Redirect a pagina di successo
   - ✅ Dashboard utente mostra "Pro Plan"
   - ✅ Badge "Active" o "Pro"

6. **Verifica in Stripe Dashboard**:
   - **Payments** → Dovresti vedere il pagamento di €19
   - **Customers** → Dovresti vedere il nuovo cliente
   - **Subscriptions** → Subscription attiva

7. **Cancella Subscription di Test**:
   - Nella tua app: Dashboard → Plans → Cancel Subscription
   - Oppure in Stripe: Customers → Seleziona → Cancel subscription

---

## 🔍 Verifiche Post-Deploy

### **1. Webhook Funzionanti**
- **Stripe Dashboard** → **Webhooks** → Seleziona endpoint
- **Recent Events** → Dovresti vedere eventi dopo il test payment
- ✅ Tutti gli eventi devono essere **"Succeeded"**

### **2. Vercel Logs**
- **Vercel Dashboard** → **Logs**
- Filtra per: `/api/webhooks/stripe`
- Cerca: `checkout.session.completed`, `customer.subscription.created`
- ✅ Non devono esserci errori

### **3. Database Check**
- Verifica che la subscription sia stata salvata:
  ```sql
  SELECT * FROM user_subscriptions 
  WHERE user_id = 'TUO_USER_ID' 
  ORDER BY created_at DESC 
  LIMIT 1;
  ```

---

## 🚨 Troubleshooting

### **Problema: Banner "Test Mode" ancora visibile**
**Causa**: Vercel sta usando ancora le chiavi di test

**Soluzione**:
1. Vercel → Environment Variables → Verifica che `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sia `pk_live_...`
2. Se corretto, fai hard refresh: `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)
3. Se ancora visibile: Redeploy application

### **Problema: Checkout in arancione (test mode)**
**Causa**: Frontend sta usando `pk_test_` invece di `pk_live_`

**Soluzione**:
1. Browser Console → Cerca `pk_test_` vs `pk_live_`
2. Vercel → Redeploy
3. Clear browser cache

### **Problema: "Error creating checkout session"**
**Causa**: Price IDs errati o mancanti

**Soluzione**:
1. Verifica che i Price IDs in Vercel siano quelli **live** (`price_live_...`)
2. Verifica che esistano in Stripe Live Mode
3. Redeploy

### **Problema: Webhook non ricevuti**
**Causa**: Webhook URL errato o secret sbagliato

**Soluzione**:
1. Stripe → Webhooks → Verifica URL: `https://ai-knowledge-companion.vercel.app/api/webhooks/stripe`
2. Testa webhook: Stripe Dashboard → Send test webhook
3. Vercel Logs → Cerca errori in `/api/webhooks/stripe`

---

## 🎉 Checklist Finale

Prima di considerare completato:

- [ ] ✅ Prodotti creati in Live Mode (Pro, Enterprise)
- [ ] ✅ 4 Price IDs copiati (mensili e annuali)
- [ ] ✅ Chiavi API live copiate (`pk_live_`, `sk_live_`)
- [ ] ✅ Webhook live configurato con signing secret
- [ ] ✅ Tutte le environment variables in Vercel (Production only)
- [ ] ✅ Application redeployata
- [ ] ✅ Banner "Test Mode" NON visibile
- [ ] ✅ Test payment completato con successo
- [ ] ✅ Subscription salvata nel database
- [ ] ✅ Webhook ricevuti correttamente
- [ ] ✅ Test subscription cancellata
- [ ] ✅ `.env.local` NON contiene chiavi live
- [ ] ✅ Email notifications configurate in Stripe

---

## 📧 Stripe Email Notifications (Raccomandato)

1. **Stripe Dashboard** → **Settings** → **Notifications**
2. **Email recipients**: Aggiungi la tua email
3. **Abilita notifiche per**:
   - ✅ Failed payments
   - ✅ Disputes
   - ✅ High-risk payments
   - ✅ Webhooks failing
   - ✅ New customers (opzionale)

---

## 🔐 Security Post-Launch

### **Immediate**
- [ ] Verifica che `.env.local` sia in `.gitignore`
- [ ] Controlla che nessuna chiave live sia su GitHub
- [ ] Verifica che solo "Production" environment ha chiavi live

### **Entro 1 settimana**
- [ ] Monitora Stripe Dashboard giornalmente
- [ ] Controlla webhook success rate (deve essere >95%)
- [ ] Verifica che non ci siano failed payments

### **Entro 1 mese**
- [ ] Setup fraud detection rules (Stripe Radar)
- [ ] Review churn rate
- [ ] Considera aggiungere più metodi di pagamento (PayPal, SEPA, ecc.)

---

## 📚 Link Utili

- **Stripe Dashboard Live**: https://dashboard.stripe.com (toggle "Live mode")
- **Webhook Logs**: https://dashboard.stripe.com/webhooks
- **Payment Logs**: https://dashboard.stripe.com/payments
- **Vercel Logs**: https://vercel.com/your-project/logs
- **Documentazione Completa**: `docs/deployment/STRIPE_PRODUCTION_SETUP.md`

---

**🎊 Buon lancio!**

