# 🎉 Image Upload 403 Error - RISOLTO

## 📊 Problema

Durante il caricamento di immagini, l'applicazione restituiva l'errore:
```
POST http://localhost:3000/api/multimedia/upload 403 (Forbidden)
Error: "You can create 200 more image"
```

## 🔍 Causa Root

Il problema era un **mismatch tra snake_case e camelCase** nel mapping dei dati dal database a TypeScript.

### Dettaglio Tecnico

1. **Database PostgreSQL** restituiva i dati in snake_case:
   ```json
   {
     "can_create": true,
     "current_count": 0,
     "max_allowed": 200,
     "message": "You can create 200 more image"
   }
   ```

2. **TypeScript** controllava le proprietà in camelCase:
   ```typescript
   if (!result.canCreate) {  // ← canCreate era undefined!
     throw new Error(result.message)
   }
   ```

3. **Risultato**: `result.canCreate` era `undefined`, che JavaScript interpreta come `false`
4. **Conseguenza**: L'API lanciava un'eccezione con il messaggio di successo, causando il 403

## ✅ Soluzione

### File Modificato
`src/lib/utils/usage-limits.ts`

### Modifica Applicata

Aggiunto mapping esplicito da snake_case a camelCase:

```typescript
// Map snake_case from database to camelCase for TypeScript
const dbResult = data[0]
return {
  canCreate: dbResult.can_create,      // ✅ Mapping esplicito
  currentCount: dbResult.current_count, // ✅ Mapping esplicito
  maxAllowed: dbResult.max_allowed,     // ✅ Mapping esplicito
  message: dbResult.message
}
```

## 🧪 Verifica

### Prima del Fix
```bash
POST /api/multimedia/upload → 403 (Forbidden)
Error: "You can create 200 more image"
```

### Dopo il Fix
```bash
POST /api/multimedia/upload → 200 (OK)
Response: {
  success: true,
  documentId: "...",
  message: "image file uploaded successfully. Processing started."
}
```

## 📋 Setup Prerequisiti

Prima di risolvere il bug principale, sono stati configurati:

1. ✅ **Database**: Colonna `max_image_files` aggiunta a `subscription_plans`
2. ✅ **Funzione RPC**: `check_usage_limit` aggiornata per supportare tipo `'image'`
3. ✅ **Storage Bucket**: Bucket `images` creato con policy RLS corrette
4. ✅ **Subscription**: Enterprise plan attivo per l'utente test

## 🎯 Lezioni Apprese

### 1. **Consistency is Key**
Mantenere coerenza nella nomenclatura tra database e codice applicativo è fondamentale.

### 2. **Explicit Type Mapping**
Quando si interfacciano sistemi con convenzioni diverse (PostgreSQL snake_case vs TypeScript camelCase), mappare esplicitamente i campi previene errori silenziosi.

### 3. **Debug Sistematico**
Il problema è stato identificato attraverso:
- Test del database (✅ funzionava)
- Test della sessione (✅ funzionava)  
- Test dell'API (❌ falliva)
- Analisi del messaggio di errore (conteneva dati di successo!)

### 4. **Type Safety**
TypeScript non ha segnalato l'errore perché `data[0]` era di tipo `any`. 
**Miglioramento futuro**: Definire interfacce tipizzate per le risposte del database.

## 🔧 Raccomandazioni Future

### 1. **Add Type Definitions**
```typescript
interface DBUsageLimitResult {
  can_create: boolean
  current_count: number
  max_allowed: number
  message: string
}
```

### 2. **Add Integration Tests**
Creare test automatici che verifichino l'upload per prevenire regressioni:
```typescript
describe('Image Upload', () => {
  it('should allow upload within limits', async () => {
    // Test implementation
  })
})
```

### 3. **Add Logging**
Migliorare il logging per identificare più facilmente problemi di mapping:
```typescript
console.log('DB Result:', dbResult)
console.log('Mapped Result:', mappedResult)
```

## 📊 Statistiche Debug

- **Tempo totale debugging**: ~2 ore
- **Script SQL creati**: 8
- **Script JS di test**: 3
- **File modificati**: 1
- **Lines of code changed**: ~10
- **Bug trovati**: 1 (ma critico!)

## 🎓 Technical Details

### Stack Involved
- **Database**: PostgreSQL (Supabase)
- **Backend**: Next.js API Routes
- **Frontend**: React + TypeScript
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Functions Used
- `check_usage_limit(p_user_id, p_resource_type)` - RPC function
- `checkUsageLimit(userId, resourceType)` - TypeScript helper
- `enforceUsageLimit(userId, resourceType)` - Validation wrapper

### Tables Involved
- `subscription_plans` - Plan definitions with limits
- `user_subscriptions` - User plan assignments
- `documents` - File records (includes `media_type = 'image'`)
- `storage.buckets` - Storage bucket configuration
- `storage.objects` - Stored files

## ✅ Status Finale

**PROBLEMA RISOLTO** ✅

L'upload delle immagini ora funziona correttamente con:
- ✅ Subscription limits verificati correttamente
- ✅ Storage bucket configurato
- ✅ RLS policies attive
- ✅ Type mapping corretto

---

**Data risoluzione**: 10 Novembre 2025  
**Gravità**: Alta (blocca feature principale)  
**Complessità**: Media (richiesta debug approfondito)  
**Impatto**: Tutti gli upload di immagini

