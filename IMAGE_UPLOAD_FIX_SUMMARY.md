# 🔧 Risoluzione Errore 403 Upload Immagini - Riepilogo

## 📋 Problema Identificato

L'errore **403 Forbidden** durante l'upload di immagini è causato da:

```
POST http://localhost:3000/api/multimedia/upload 403 (Forbidden)
```

**Causa principale**: La funzione database `check_usage_limit` non supporta il tipo di risorsa `'image'`, causando il fallimento del controllo dei limiti di utilizzo.

## ✅ Cosa è Stato Fatto

Ho creato gli script necessari per risolvere completamente il problema:

### 1. Script di Correzione Completo
📄 **File**: `sql/FIX_IMAGE_SUPPORT.sql`

Questo script risolve tutti i problemi in un'unica esecuzione:
- ✅ Crea il bucket Storage `images` (se non esiste)
- ✅ Aggiunge la colonna `max_image_files` alla tabella `subscription_plans`
- ✅ Aggiorna i piani con limiti immagini (Trial: 5, Pro: 50, Enterprise: 200)
- ✅ Aggiorna la funzione `check_usage_limit` per supportare `'image'`
- ✅ Aggiorna la funzione `get_user_subscription` con `max_image_files`
- ✅ Crea le policy RLS per il bucket `images`

### 2. Script di Diagnostica
📄 **File**: `sql/DIAGNOSE_IMAGE_SUPPORT.sql`

Script per verificare che tutto sia configurato correttamente.

### 3. Documentazione Completa
📄 **File**: `docs/FIX_IMAGE_UPLOAD_403.md`

Guida dettagliata step-by-step con troubleshooting.

## 🚀 Cosa Devi Fare Ora

### Passo 1: Esegui lo Script di Correzione

1. Apri **Supabase Dashboard** (https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (nella sidebar)
4. Clicca su **+ New query**
5. Copia l'intero contenuto del file:
   ```
   sql/FIX_IMAGE_SUPPORT.sql
   ```
6. Incollalo nell'editor
7. Clicca su **Run** (o premi Ctrl/Cmd + Enter)
8. Verifica che appaia il messaggio di successo:
   ```
   ✅ Image support configuration complete!
   ```

### Passo 2: Verifica la Configurazione

Esegui lo script diagnostico per confermare che tutto funzioni:

1. Sempre in **SQL Editor**, crea una **nuova query**
2. Copia il contenuto di:
   ```
   sql/DIAGNOSE_IMAGE_SUPPORT.sql
   ```
3. Esegui lo script
4. Verifica i risultati:
   - Query 1: Dovrebbe mostrare la colonna `max_image_files`
   - Query 2: Dovrebbe mostrare i limiti per ogni piano
   - Query 5: Dovrebbe mostrare il bucket `images`
   - Query 6: Dovrebbe mostrare le policy RLS

### Passo 3: Testa l'Upload

1. **Ricarica completamente l'applicazione** (Ctrl/Cmd + Shift + R per hard reload)
2. Vai alla sezione **Multimedia**
3. Seleziona il tab **Images**
4. Trascina un'immagine o clicca per selezionarla
5. Clicca su **Upload All**

**Risultato atteso**:
- ✅ Nessun errore 403
- ✅ Messaggio di successo
- ✅ L'immagine compare nella lista

## 🛠️ Troubleshooting

Se dopo aver eseguito lo script ricevi ancora errori:

### Errore: "Bucket does not exist"

**Soluzione**: Crea il bucket manualmente:
1. Vai su **Supabase Dashboard → Storage**
2. Clicca **+ New bucket**
3. Nome: `images`
4. Public: ❌ (NO, deve essere privato)
5. File size limit: `10 MB`
6. Allowed MIME types:
   ```
   image/jpeg
   image/jpg
   image/png
   image/gif
   image/webp
   ```

### Errore: "No active subscription found"

**Soluzione**: Verifica la sottoscrizione dell'utente corrente:

```sql
-- Verifica sottoscrizione
SELECT * FROM user_subscriptions WHERE user_id = auth.uid();

-- Se non esiste, assegnala manualmente
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, trial_end_date)
SELECT 
  auth.uid(),
  sp.id,
  'trial',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
FROM subscription_plans sp
WHERE sp.name = 'trial';
```

### Errore: Policy violation

**Soluzione**: Riesegui lo script `FIX_IMAGE_SUPPORT.sql` per ricreare le policy.

## 📊 Limiti Configurati

Dopo l'esecuzione dello script, i piani avranno questi limiti per le immagini:

| Piano       | Immagini |
|-------------|----------|
| Trial       | 5        |
| Pro         | 50       |
| Enterprise  | 200      |

## 📁 File Modificati/Creati

1. ✅ `sql/FIX_IMAGE_SUPPORT.sql` - Script principale (NUOVO)
2. ✅ `sql/DIAGNOSE_IMAGE_SUPPORT.sql` - Script diagnostica (NUOVO)
3. ✅ `docs/FIX_IMAGE_UPLOAD_403.md` - Documentazione (NUOVO)
4. ✅ `IMAGE_UPLOAD_FIX_SUMMARY.md` - Questo riepilogo (NUOVO)

Nessun file del codebase è stato modificato - tutti i cambiamenti sono nel database.

## 🎯 Prossimi Passi

Dopo aver verificato che l'upload funzioni:

1. ✅ Testa upload di vari formati (JPG, PNG, GIF, WebP)
2. ✅ Verifica che le immagini appaiano nella lista
3. ✅ Testa il limite del piano (prova a superare il limite)
4. ✅ Verifica che altri utenti non possano vedere le tue immagini

## 📞 Hai Bisogno di Aiuto?

Se il problema persiste:

1. Esegui lo script `sql/DIAGNOSE_IMAGE_SUPPORT.sql`
2. Condividi i risultati completi
3. Controlla i log del server nel terminale
4. Controlla la console del browser (F12 → Console)

---

**Tempo stimato per la risoluzione**: 5-10 minuti

**Difficoltà**: Facile ⭐⭐☆☆☆

**Richiede riavvio app**: ❌ No (solo hard reload del browser)

