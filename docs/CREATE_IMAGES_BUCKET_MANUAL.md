# Come Creare Manualmente il Bucket 'images' in Supabase

Se l'errore 403 persiste, è molto probabile che il **bucket `images` non esista** nel tuo Supabase Storage. Ecco come crearlo manualmente.

## Metodo 1: Via Dashboard Supabase (RACCOMANDATO)

### Passo 1: Verifica se il Bucket Esiste

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Clicca su **Storage** nella sidebar sinistra
4. Controlla se vedi un bucket chiamato **`images`**

### Passo 2: Crea il Bucket (se non esiste)

1. In **Storage**, clicca sul pulsante **"New bucket"** (o "+ Create bucket")
2. Compila il form con questi valori:

   ```
   Nome: images
   Public: NO ❌ (deseleziona - deve essere PRIVATO)
   File size limit: 10 MB
   Allowed MIME types: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/gif
     - image/webp
   ```

3. Clicca su **"Create bucket"** o **"Save"**

### Passo 3: Configura le Policies (Automatico via SQL)

Dopo aver creato il bucket:

1. Vai su **SQL Editor**
2. Esegui lo script:
   ```
   sql/CREATE_IMAGES_BUCKET_MANUAL.sql
   ```

Questo script:
- ✅ Verifica che il bucket esista
- ✅ Crea/aggiorna il bucket (se necessario)
- ✅ Crea tutte le policy RLS necessarie
- ✅ Verifica che tutto sia configurato correttamente

## Metodo 2: Solo via SQL (Alternativo)

Se preferisci fare tutto via SQL:

1. Apri **Supabase Dashboard → SQL Editor**
2. Esegui lo script completo:
   ```
   sql/CREATE_IMAGES_BUCKET_MANUAL.sql
   ```

Lo script:
- Crea il bucket `images` se non esiste
- Configura i limiti di dimensione (10MB)
- Abilita i tipi MIME corretti
- Crea tutte le policy RLS

## Verifica della Configurazione

Dopo aver creato il bucket, esegui questo query per verificare:

```sql
-- Verifica bucket
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types
FROM storage.buckets
WHERE id = 'images';
```

**Risultato atteso:**
```json
{
  "id": "images",
  "name": "images",
  "public": false,
  "file_size_limit": 10485760,
  "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
}
```

## Verifica delle Policy RLS

Esegui questa query per verificare le policy:

```sql
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%image%'
ORDER BY policyname;
```

**Risultato atteso (4 policy):**
```
Users can delete own images | DELETE
Users can upload own images | INSERT
Users can view own images   | SELECT
Users can update own images | UPDATE
```

## Test Upload

1. **Ricarica l'applicazione** (Ctrl/Cmd + Shift + R)
2. Vai su **Multimedia → Images**
3. Prova a caricare un'immagine
4. Dovrebbe funzionare! ✅

## Troubleshooting

### Errore: "Bucket already exists" quando esegui lo script

**Soluzione**: È normale! Lo script usa `ON CONFLICT DO UPDATE` per aggiornare il bucket se già esiste. Continua con le query successive per configurare le policy.

### Errore: "Policy already exists"

**Soluzione**: Lo script elimina prima le policy esistenti con `DROP POLICY IF EXISTS`. Se ricevi comunque questo errore, esegui manualmente:

```sql
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
```

Poi riesegui lo script completo.

### Il bucket appare vuoto anche dopo l'upload

**Soluzione**: 
1. Verifica che l'upload non abbia restituito errori 403
2. Controlla i log del server nel terminale
3. Verifica le policy RLS con la query sopra
4. Prova a rifare l'upload dopo aver ricaricato la pagina

### Altri bucket (audio, videos, documents) funzionano ma images no

**Soluzione**: Probabilmente il bucket `images` non è stato creato. Segui i passaggi di questo documento per crearlo.

## Differenze tra i Metodi

### Dashboard (Metodo 1)
✅ **Pro**: Interfaccia visuale, più facile per principianti
❌ **Contro**: Devi poi eseguire lo script SQL per le policy

### SQL (Metodo 2)
✅ **Pro**: Automatico, crea tutto in un colpo solo
❌ **Contro**: Potrebbe non funzionare se mancano permessi

## Prossimi Passi

Dopo aver creato il bucket:

1. ✅ Ricarica l'app
2. ✅ Testa l'upload di un'immagine
3. ✅ Verifica che appaia nella lista
4. ✅ Testa i limiti del piano (prova a superare il limite)

## File Correlati

- `sql/CREATE_IMAGES_BUCKET_MANUAL.sql` - Script completo per creazione bucket
- `sql/VERIFY_IMAGE_UPLOAD.sql` - Script di verifica approfondita
- `sql/FIX_IMAGE_SUPPORT.sql` - Script principale (già eseguito)
- `docs/FIX_IMAGE_UPLOAD_403.md` - Guida completa risoluzione errore 403

## Note Importanti

⚠️ **Il bucket DEVE essere privato (public: false)**
- Le immagini sono protette da RLS
- Ogni utente vede solo le proprie immagini
- L'accesso è controllato dalle policy

⚠️ **I tipi MIME devono includere tutti i formati supportati**
- Se manca un formato, l'upload fallirà
- Formati supportati: JPG, JPEG, PNG, GIF, WebP

⚠️ **Le policy devono usare `auth.uid()`**
- Permette l'accesso solo all'utente proprietario
- Il path è: `{user_id}/{filename}`
- La policy controlla: `(storage.foldername(name))[1] = auth.uid()::text`

---

**Tempo stimato**: 5 minuti
**Difficoltà**: Facile ⭐☆☆☆☆

