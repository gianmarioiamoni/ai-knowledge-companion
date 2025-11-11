# ✅ Soluzione Completa Errore 403 - Upload Immagini

## 🎯 Situazione Attuale

### ✅ Database: TUTTO OK!

Il database è configurato perfettamente:
- ✅ Subscription Enterprise attiva per `gia.iamoni@tiscali.it`
- ✅ User ID: `05237d7e-320d-45ba-9499-94ef49e3be89`
- ✅ Limite immagini: 0/200 (puoi caricare 200 immagini)
- ✅ `check_usage_limit` restituisce `can_create: true`
- ✅ Bucket `images` esiste con policy corrette

### ❌ Problema: SESSION MISMATCH

L'errore 403 è causato da un **disallineamento tra la sessione del browser e l'autenticazione dell'API**.

---

## 🚀 Soluzione Rapida (3 Minuti)

### **Step 1: Verifica la Sessione**

1. Apri l'app nel browser
2. Apri DevTools (F12)
3. Vai sul tab **Console**
4. Incolla e esegui:

```javascript
fetch('/api/debug/session')
  .then(r => r.json())
  .then(data => {
    console.log('=== VERIFICA SESSIONE ===');
    console.log('✓ Autenticato:', data.authenticated);
    console.log('✓ Email corrente:', data.user?.email);
    console.log('✓ User ID corrente:', data.user?.id);
    console.log('✓ User ID atteso:', data.expected_user_id);
    console.log('✓ IDs corrispondono:', data.user_id_matches);
    console.log('✓ Può caricare immagini:', data.subscription_check?.can_create);
    console.log('\n📊 Dati completi:', data);
  });
```

### **Step 2: Interpreta i Risultati**

#### ✅ **CASO A: Tutto OK** (`user_id_matches: true`)

```javascript
{
  authenticated: true,
  user_id_matches: true,
  subscription_check: { can_create: true }
}
```

**Azione:** Vai a **Step 3A**

#### ❌ **CASO B: User ID sbagliato** (`user_id_matches: false`)

```javascript
{
  authenticated: true,
  user_id_matches: false,  // ← PROBLEMA!
  user: { email: "altra@email.com" }
}
```

**Azione:** Vai a **Step 3B**

#### ❌ **CASO C: Non autenticato** (`authenticated: false`)

```javascript
{
  authenticated: false
}
```

**Azione:** Vai a **Step 3C**

---

### **Step 3A: Sessione OK - Testa Upload Diretto**

Se la sessione è corretta, testa l'upload direttamente:

```javascript
async function testUpload() {
  console.log('🧪 Testing upload...');
  
  // Crea un'immagine test (1x1 pixel PNG)
  const blob = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
    .then(r => r.blob());
  
  const formData = new FormData();
  formData.append('file', blob, 'test.png');
  formData.append('mediaType', 'image');
  
  const response = await fetch('/api/multimedia/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  console.log('Status:', response.status);
  console.log('Response:', data);
  
  if (response.ok) {
    console.log('✅ UPLOAD RIUSCITO!');
    return { success: true, data };
  } else {
    console.error('❌ UPLOAD FALLITO:', data.error);
    return { success: false, error: data.error };
  }
}

testUpload();
```

**Se funziona:** 🎉 **PROBLEMA RISOLTO!** Prova ora dall'interfaccia.

**Se non funziona:** Controlla i log del server nel terminale e condividi l'errore.

---

### **Step 3B: User ID Sbagliato - Ri-autentica**

Sei loggato con l'utente sbagliato. Esegui:

```javascript
// 1. Pulisci tutti i dati di autenticazione
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cache pulita');

// 2. Ricarica la pagina
location.reload();
```

Poi:
1. **Fai login** con: `gia.iamoni@tiscali.it`
2. **Torna a Step 1** per verificare
3. **Prova l'upload**

---

### **Step 3C: Non Autenticato - Login**

```javascript
// Pulisci la cache
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Poi:
1. **Fai login** nell'app
2. **Torna a Step 1** per verificare

---

## 🔧 Soluzione Alternativa: Reset Completo

Se nulla funziona:

```bash
# 1. Stop il server dev
# Ctrl+C nel terminale

# 2. Pulisci la cache di Next.js
rm -rf .next

# 3. Riavvia
npm run dev
```

Nel browser:
```javascript
// 4. Pulisci tutto
localStorage.clear();
sessionStorage.clear();
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});

// 5. Ricarica
location.reload();
```

Poi:
1. **Login**
2. **Verifica sessione** (Step 1)
3. **Prova upload**

---

## 📊 Checklist Veloce

Prima di provare l'upload:

- [ ] Eseguito `/api/debug/session`
- [ ] `authenticated: true` ✓
- [ ] `user_id_matches: true` ✓
- [ ] `email: "gia.iamoni@tiscali.it"` ✓
- [ ] `can_create: true` ✓
- [ ] Hard reload (Ctrl/Cmd + Shift + R)
- [ ] Prova upload ✓

---

## 🎯 Test Finale

Dopo aver sistemato la sessione:

1. **Vai su Multimedia → Images**
2. **Seleziona un'immagine**
3. **Clicca "Upload All"**
4. **Dovrebbe funzionare!** ✅

---

## 📝 Se Serve Aiuto

Esegui e condividi:

```javascript
// Verifica completa
async function diagnoseComplete() {
  console.log('=== DIAGNOSI COMPLETA ===\n');
  
  // 1. Sessione
  const session = await fetch('/api/debug/session').then(r => r.json());
  console.log('1. Sessione:', session);
  
  // 2. Test upload
  try {
    const blob = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==').then(r => r.blob());
    const formData = new FormData();
    formData.append('file', blob, 'test.png');
    const uploadRes = await fetch('/api/multimedia/upload', { method: 'POST', body: formData });
    const uploadData = await uploadRes.json();
    console.log('2. Test Upload:', { status: uploadRes.status, data: uploadData });
  } catch (e) {
    console.log('2. Test Upload ERROR:', e.message);
  }
  
  // 3. Storage
  console.log('3. LocalStorage keys:', Object.keys(localStorage));
  
  return 'Diagnosi completata - controlla i risultati sopra';
}

diagnoseComplete();
```

Condividi:
- Output console completo
- Log del server (terminale dove gira `npm run dev`)
- Screenshot dell'errore se possibile

---

## 🗑️ Pulizia Post-Debug

**IMPORTANTE:** Dopo aver risolto, elimina:

```bash
rm src/app/api/debug/session/route.ts
```

Questo endpoint espone informazioni sensibili!

---

## 📚 File di Riferimento

- `docs/DEBUG_SESSION_403.md` - Guida completa debug
- `sql/TEST_WITH_REAL_USER_ID.sql` - Test database con user ID
- `sql/CREATE_ENTERPRISE_SUBSCRIPTION.sql` - (Non serve, già OK)
- `src/app/api/debug/session/route.ts` - Endpoint debug (da eliminare dopo)

---

## ✅ Recap

1. **Database**: ✅ Perfetto
2. **Subscription**: ✅ Enterprise attiva
3. **Limiti**: ✅ 200 immagini disponibili
4. **Bucket**: ✅ Configurato correttamente
5. **Problema**: ❌ Sessione/autenticazione

**Soluzione**: Verifica sessione → Ri-autentica se necessario → Test upload

**Tempo stimato**: 3-5 minuti

🎉 **Buona fortuna!**

