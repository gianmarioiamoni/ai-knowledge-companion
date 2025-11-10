# Fix: Image Upload 403 Error

## Problema

Quando si carica un'immagine, si riceve l'errore:
```
POST http://localhost:3000/api/multimedia/upload 403 (Forbidden)
```

## Causa

La funzione `check_usage_limit` nel database non supporta ancora il tipo di risorsa `'image'`. Questo causa il fallimento del controllo dei limiti di utilizzo quando si tenta di caricare un'immagine, risultando in un errore 403.

## Soluzione

Segui questi passaggi **nell'ordine indicato**:

### 1. Esegui lo Script di Correzione

1. Apri **Supabase Dashboard**
2. Vai su **SQL Editor**
3. Crea una **nuova query**
4. Copia e incolla il contenuto del file:
   ```
   sql/FIX_IMAGE_SUPPORT.sql
   ```
5. Clicca su **Run** per eseguire lo script

Lo script eseguirà automaticamente:
- ✅ Creazione del bucket `images` in Storage (se non esiste)
- ✅ Aggiunta della colonna `max_image_files` alla tabella `subscription_plans`
- ✅ Aggiornamento dei piani con i limiti per le immagini:
  - Trial: 5 immagini
  - Pro: 50 immagini
  - Enterprise: 200 immagini
- ✅ Aggiornamento della funzione `check_usage_limit` per supportare il tipo `'image'`
- ✅ Aggiornamento della funzione `get_user_subscription` per includere `max_image_files`
- ✅ Creazione delle policy RLS per il bucket `images`

### 2. Verifica il Bucket Images (Opzionale ma Consigliato)

Se lo script SQL non riesce a creare il bucket automaticamente:

1. Vai su **Supabase Dashboard → Storage**
2. Clicca su **Create a new bucket**
3. Inserisci i seguenti dettagli:
   - **Name**: `images`
   - **Public**: ❌ (deseleziona - deve essere privato)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: 
     ```
     image/jpeg
     image/jpg
     image/png
     image/gif
     image/webp
     ```
4. Clicca su **Save**

### 3. Verifica la Configurazione

Esegui lo script diagnostico per verificare che tutto sia configurato correttamente:

1. Apri **Supabase Dashboard → SQL Editor**
2. Esegui il contenuto del file:
   ```
   sql/DIAGNOSE_IMAGE_SUPPORT.sql
   ```
3. Verifica i risultati:

**Query 1**: Dovrebbe restituire la colonna `max_image_files`:
```json
{
  "column_name": "max_image_files",
  "data_type": "integer",
  "is_nullable": "NO",
  "column_default": "0"
}
```

**Query 2**: Dovrebbe mostrare i limiti per ogni piano:
```
trial       | 5
pro         | 50
enterprise  | 200
```

**Query 5**: Dovrebbe mostrare il bucket `images`:
```json
{
  "id": "images",
  "name": "images",
  "public": false,
  "file_size_limit": 10485760,
  "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
}
```

### 4. Test Upload

1. Ricarica l'applicazione web (Ctrl/Cmd + R)
2. Vai alla sezione **Multimedia**
3. Prova a caricare un'immagine
4. L'upload dovrebbe ora funzionare correttamente

## Verifica del Problema Risolto

Se tutto è configurato correttamente, vedrai:

✅ **Nessun errore 403**
✅ **Messaggio di successo**: "Image file uploaded successfully. Processing started."
✅ **L'immagine compare nella lista dei file multimediali**

## Troubleshooting

### Errore: "No active subscription found"

Se ricevi questo errore, significa che l'utente non ha una sottoscrizione attiva:

1. Verifica che l'utente abbia una sottoscrizione:
   ```sql
   SELECT * FROM user_subscriptions WHERE user_id = auth.uid();
   ```

2. Se non ha una sottoscrizione, il trigger dovrebbe crearne una automaticamente. Verifica che il trigger sia attivo:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'assign_trial_plan_trigger';
   ```

3. Se necessario, assegna manualmente un piano trial:
   ```sql
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

### Errore: "Bucket does not exist"

Se il bucket non è stato creato automaticamente:

1. Crea il bucket manualmente tramite Dashboard (vedi Step 2)
2. Oppure esegui questo comando SQL:
   ```sql
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
     'images',
     'images',
     false,
     10485760,
     ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
   );
   ```

### Errore: "Policy violation"

Se ricevi errori di policy RLS:

1. Verifica che le policy esistano:
   ```sql
   SELECT * FROM pg_policies 
   WHERE schemaname = 'storage' 
     AND tablename = 'objects' 
     AND policyname LIKE '%image%';
   ```

2. Se mancano, riesegui lo script `FIX_IMAGE_SUPPORT.sql`

## File Coinvolti

- `sql/FIX_IMAGE_SUPPORT.sql` - Script principale di correzione
- `sql/DIAGNOSE_IMAGE_SUPPORT.sql` - Script di diagnostica
- `sql/27_add_image_files_support.sql` - Script originale (riferimento)
- `src/app/api/multimedia/upload/route.ts` - API endpoint per upload
- `src/components/multimedia/ui/image-uploader.tsx` - Componente UI per upload
- `src/lib/utils/usage-limits.ts` - Logica di controllo limiti

## Prossimi Passi

Dopo aver risolto il problema 403:

1. ✅ Testa l'upload di immagini di vari formati (JPG, PNG, GIF, WebP)
2. ✅ Verifica che le immagini caricate appaiano nella lista
3. ✅ Testa i limiti di upload (prova a superare il limite del piano)
4. ✅ Verifica che le policy RLS impediscano l'accesso alle immagini di altri utenti

## Supporto

Se il problema persiste dopo aver seguito questi passaggi:

1. Controlla i log del server (terminale dove gira `npm run dev`)
2. Controlla la console del browser (F12 → Console)
3. Verifica che tutte le variabili d'ambiente siano configurate correttamente
4. Esegui lo script diagnostico e condividi i risultati

