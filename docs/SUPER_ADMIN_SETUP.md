# 🔐 Super Admin Setup Guide

## Quick Start (3 minuti)

### 1️⃣ Configura Credenziali

Crea/modifica `.env.local` nella root del progetto:

```bash
# Super Admin Credentials
ADMIN_EMAIL=admin@tuodominio.com
ADMIN_PASSWORD=UnaPas$w0rdMoltoS1cura!2024

# Solo per produzione (opzionale in dev)
# BOOTSTRAP_SECRET=un_token_random_molto_lungo
```

### 2️⃣ Avvia il Server

```bash
npm run dev
```

### 3️⃣ Crea Super Admin

**Metodo A - Script Automatico (consigliato):**
```bash
./scripts/create-super-admin.sh
```

**Metodo B - Manuale (cURL):**
```bash
# Verifica stato attuale
curl http://localhost:3000/api/admin/bootstrap

# Crea super admin
curl -X POST http://localhost:3000/api/admin/bootstrap
```

**Metodo C - Browser:**
1. Apri in una nuova tab: `http://localhost:3000/api/admin/bootstrap`
2. Dovresti vedere: `{"exists":false,"error":"Super admin not found"}`
3. Usa uno strumento come Postman o Thunder Client per fare una richiesta POST a quell'URL

### 4️⃣ Login

1. Vai a: http://localhost:3000/auth/sign-in
2. Inserisci le credenziali da `.env.local`:
   - Email: valore di `ADMIN_EMAIL`
   - Password: valore di `ADMIN_PASSWORD`
3. Dopo il login, accedi alla dashboard admin: http://localhost:3000/admin/users

---

## ✅ Verifica Successo

Dopo il login come super admin, dovresti vedere:

- ✅ Nel menu principale: voce **"Admin"** con sottomenu
- ✅ Puoi accedere a tutte le pagine admin:
  - `/admin/dashboard` - Dashboard amministrativa
  - `/admin/users` - Gestione utenti
  - `/admin/billing` - Billing aggregato
- ✅ Nella pagina Users, il tuo badge role è **"SUPER ADMIN"**
- ✅ Nel dropdown azioni vedi TUTTE le azioni:
  - Reset Password
  - Disable User
  - Enable User
  - Delete User
  - Promote to Admin
  - Demote to User

---

## 🔄 Cosa Fa lo Script Bootstrap?

Lo script di bootstrap (`/api/admin/bootstrap`):

1. **Verifica** se esiste già un super admin nel database
2. **Se NON esiste:**
   - Crea un nuovo utente in `auth.users` con le credenziali da `.env.local`
   - Auto-conferma l'email (no email verification needed)
   - Crea/aggiorna il profilo in `profiles` table con `role='super_admin'`
   - Imposta `status='active'`
3. **Se esiste:**
   - Verifica che l'email corrisponda a quella in `.env.local`
   - Ritorna le info dell'utente esistente

---

## 🛡️ Sicurezza

### Sviluppo
- In sviluppo (`NODE_ENV=development`), l'endpoint è **aperto**
- Nessuna autenticazione richiesta per chiamare `/api/admin/bootstrap`

### Produzione
- In produzione, l'endpoint è **protetto**
- Richiede header: `Authorization: Bearer YOUR_BOOTSTRAP_SECRET`
- Il `BOOTSTRAP_SECRET` deve essere configurato in `.env` (o variabili ambiente Vercel)
- Esempio chiamata in produzione:
  ```bash
  curl -X POST https://tuoapp.vercel.app/api/admin/bootstrap \
    -H "Authorization: Bearer tuo_bootstrap_secret"
  ```

---

## 🐛 Troubleshooting

### Problema: "Missing ADMIN_EMAIL or ADMIN_PASSWORD"
**Soluzione:** Verifica che `.env.local` contenga entrambe le variabili e riavvia il server.

### Problema: "Email already registered"
**Soluzione:** L'utente esiste già in Supabase. Opzioni:
1. Usa un'altra email in `.env.local`
2. Oppure elimina l'utente esistente da Supabase Dashboard → Authentication

### Problema: "Failed to create super admin profile"
**Soluzione:** 
1. Verifica che il database migration `sql/24_authorization_schema.sql` sia stato eseguito
2. Controlla che la tabella `profiles` abbia le colonne `role` e `status`
3. Verifica i log di Supabase per errori RLS

### Problema: "Unauthorized" dopo login
**Soluzione:**
1. Verifica nel database che l'utente abbia `role='super_admin'`
2. Controlla i log della console browser per errori
3. Prova a fare logout e login di nuovo

### Problema: Non vedo il menu "Admin"
**Soluzione:**
1. Apri DevTools → Console
2. Verifica che `useRole()` ritorni `isSuperAdmin: true`
3. Fai hard refresh (Cmd+Shift+R su Mac, Ctrl+Shift+R su Windows)

---

## 📊 Verifica Manuale nel Database

Puoi verificare manualmente in Supabase Dashboard:

```sql
-- Verifica super admin
SELECT 
  p.id,
  u.email,
  p.role,
  p.status,
  p.display_name,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'super_admin';
```

Dovresti vedere una riga con:
- `role`: `super_admin`
- `status`: `active`
- `email`: l'email configurata in `.env.local`

---

## 🔁 Reset Super Admin

Se vuoi resettare il super admin:

1. **Metodo A - Via Supabase Dashboard:**
   - Authentication → Users → Trova l'utente → Delete

2. **Metodo B - Via SQL:**
   ```sql
   -- Trova l'ID del super admin
   SELECT id FROM profiles WHERE role = 'super_admin';
   
   -- Elimina l'utente (cascade su profile)
   DELETE FROM auth.users WHERE id = 'super-admin-id';
   ```

3. **Ricrea:**
   - Aggiorna `ADMIN_EMAIL` in `.env.local` se necessario
   - Riavvia il server
   - Esegui di nuovo `./scripts/create-super-admin.sh`

---

## 📝 Note Importanti

1. **Un Solo Super Admin**: Il sistema è progettato per avere UN SOLO super admin. Se provi a crearne un secondo, lo script verificherà che esista già e non farà nulla.

2. **Email Auto-confermata**: Il super admin viene creato con email già confermata, quindi puoi fare login immediatamente.

3. **Password Reset**: Se dimentichi la password del super admin:
   - Opzione A: Cambia `ADMIN_PASSWORD` in `.env.local` ed elimina/ricrea l'utente
   - Opzione B: Usa Supabase Dashboard → Authentication → Reset password manualmente

4. **Migrazione Ruoli**: Una volta loggato come super admin, puoi promuovere altri utenti ad "admin" dalla pagina `/admin/users`.

---

## 🎯 Prossimi Passi

Una volta creato il super admin:

1. ✅ Testa tutte le funzionalità admin
2. ✅ Crea altri utenti di test per verificare i permessi
3. ✅ Prova a promuovere un utente normale ad admin
4. ✅ Verifica che utenti normali NON possano accedere alle pagine admin

---

## 📚 Riferimenti

- **Authorization System**: `docs/AUTHORIZATION_SETUP.md`
- **API Routes**: `src/app/api/admin/`
- **Bootstrap Logic**: `src/lib/auth/bootstrap-super-admin.ts`
- **Database Schema**: `sql/24_authorization_schema.sql`

---

**Creato**: 2024
**Ultima modifica**: 2024

