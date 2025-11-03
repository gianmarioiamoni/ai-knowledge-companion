# Centralized Error Handling

Sistema centralizzato di gestione degli errori per garantire consistenza e riutilizzabilità in tutta l'applicazione.

## 📁 Struttura

```
src/components/error/
├── error-display.tsx        # Componente orchestratore principale
├── ui/
│   ├── error-inline.tsx     # Errori inline per contesti piccoli
│   ├── error-card.tsx       # Errori in card per sezioni
│   ├── error-alert.tsx      # Alert con dismiss per errori prominenti
│   └── error-page.tsx       # Errori full-page per stati critici
├── index.ts                 # Barrel export
└── README.md               # Questa documentazione
```

## 🎯 Componenti

### ErrorDisplay (Orchestrator)

Componente principale che seleziona automaticamente la variante appropriata.

```tsx
import { ErrorDisplay } from '@/components/error';

<ErrorDisplay 
  error="Something went wrong" 
  variant="card" 
  severity="error"
/>
```

### Varianti Disponibili

#### 1. **inline** - Errori contestuali piccoli
Ideale per: messaggi di validazione form, errori in-line

```tsx
<ErrorDisplay 
  error="Field is required" 
  variant="inline"
  severity="error"
/>
```

#### 2. **card** - Errori in sezioni
Ideale per: errori in sezioni, componenti, tabelle

```tsx
<ErrorDisplay 
  error="Failed to load data" 
  variant="card"
  severity="error"
/>
```

#### 3. **alert** - Alert dismissibili
Ideale per: notifiche di errore, feedback utente

```tsx
<ErrorDisplay 
  error="Operation failed" 
  variant="alert"
  severity="error"
  onDismiss={clearError}
/>
```

#### 4. **page** - Errori full-page
Ideale per: errori critici, stati di errore della pagina

```tsx
<ErrorDisplay 
  error="Failed to load page" 
  variant="page"
  severity="error"
  title="Page Error"
/>
```

## 🎨 Severity Levels

- **error**: Errori critici (rosso)
- **warning**: Avvisi (giallo)
- **info**: Informazioni (blu)

```tsx
<ErrorDisplay 
  error="This is a warning" 
  variant="card"
  severity="warning"
/>
```

## 🪝 Hook per Gestione Errori

### useErrorHandler

Hook per gestire lo stato degli errori in modo consistente.

```tsx
import { useErrorHandler } from '@/hooks/use-error-handler';

function MyComponent() {
  const { error, setError, clearError, hasError } = useErrorHandler();

  const handleAction = async () => {
    try {
      await someOperation();
    } catch (err) {
      setError(err); // Normalizza automaticamente l'errore
    }
  };

  return (
    <>
      <ErrorDisplay 
        error={error} 
        variant="alert" 
        onDismiss={clearError}
      />
      {/* resto del componente */}
    </>
  );
}
```

## 📝 Tipi

### AppError

```typescript
interface AppError {
  message: string;
  severity?: ErrorSeverity;
  code?: string;
  details?: string;
  timestamp?: Date;
}
```

### ErrorDisplayProps

```typescript
interface ErrorDisplayProps {
  error: string | AppError | null | undefined;
  variant?: ErrorVariant;
  severity?: ErrorSeverity;
  title?: string;
  className?: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  showTimestamp?: boolean;
}
```

## 🔧 Utility Functions

### normalizeError

Normalizza qualsiasi tipo di errore in `AppError`.

```typescript
import { normalizeError } from '@/types/error';

const normalized = normalizeError('Simple error string');
// { message: 'Simple error string', severity: 'error', timestamp: Date }
```

### formatErrorMessage

Estrae il messaggio dall'errore.

```typescript
import { formatErrorMessage } from '@/types/error';

const message = formatErrorMessage(error);
```

## 📋 Best Practices

1. **Usa sempre il sistema centralizzato** invece di creare componenti di errore ad-hoc
2. **Scegli la variante appropriata** in base al contesto:
   - `inline` per form e validazioni
   - `card` per sezioni e componenti
   - `alert` per feedback dismissibili
   - `page` per errori critici di pagina
3. **Usa il hook useErrorHandler** per gestione consistente dello stato
4. **Fornisci messaggi chiari** e internazionalizzati
5. **Aggiungi onDismiss** per errori recuperabili
6. **Usa severity appropriato**: `error`, `warning`, o `info`

## 🌐 Internazionalizzazione

Aggiungi le traduzioni in `messages/en.json` e `messages/it.json`:

```json
{
  "errors": {
    "generic": "An error occurred",
    "loadFailed": "Failed to load data",
    "saveFailed": "Failed to save changes"
  }
}
```

Usa con `useTranslations`:

```tsx
const t = useTranslations('errors');

<ErrorDisplay 
  error={t('loadFailed')} 
  variant="card"
/>
```

## 🔄 Migrazione da Componenti Esistenti

### Prima
```tsx
<div className="text-red-600">
  {error && <p>{error}</p>}
</div>
```

### Dopo
```tsx
<ErrorDisplay 
  error={error} 
  variant="inline"
/>
```

## 📚 Esempi Completi

### Form con Validazione
```tsx
function MyForm() {
  const { error, setError, clearError } = useErrorHandler();
  
  return (
    <form>
      <input {...field} />
      <ErrorDisplay 
        error={error} 
        variant="inline"
        className="mt-1"
      />
    </form>
  );
}
```

### Pagina con Caricamento
```tsx
function MyPage() {
  const { data, loading, error } = useData();
  
  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        variant="page"
        title="Failed to Load Page"
      />
    );
  }
  
  return <div>{/* content */}</div>;
}
```

### Sezione con Errore Dismissibile
```tsx
function MySection() {
  const { error, setError, clearError } = useErrorHandler();
  
  return (
    <section>
      <ErrorDisplay 
        error={error} 
        variant="alert"
        onDismiss={clearError}
        className="mb-4"
      />
      {/* content */}
    </section>
  );
}
```

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '@/components/error';

test('displays error message', () => {
  render(<ErrorDisplay error="Test error" variant="card" />);
  expect(screen.getByText('Test error')).toBeInTheDocument();
});
```

## 🚀 Future Enhancements

- [ ] Toast notifications per errori non-blocking
- [ ] Error boundaries per catch automatico
- [ ] Logging automatico degli errori
- [ ] Integrazione con servizi di error tracking (Sentry, etc.)
- [ ] Retry mechanism per errori di rete

