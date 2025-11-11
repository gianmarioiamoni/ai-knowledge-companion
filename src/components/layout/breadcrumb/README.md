# Breadcrumb Component - SRP Architecture

## 📁 Struttura dei File

```
layout/
├── breadcrumb.tsx                    # Componente principale (orchestratore)
└── breadcrumb/                       # Moduli separati per responsabilità
    ├── index.ts                      # Exports centralizzati
    ├── humanize-slug.ts              # Utility: conversione slug
    ├── use-breadcrumb-items.ts       # Logic: costruzione breadcrumb items
    ├── breadcrumb-list.tsx           # UI: lista breadcrumb
    ├── breadcrumb-item.tsx           # UI: singolo item
    ├── breadcrumb-separator.tsx      # UI: separatore
    └── README.md                     # Documentazione
```

## 🎯 Principi SRP Applicati

### **1. breadcrumb.tsx** - Main Orchestrator
**Responsabilità:** 
- Coordinare i sotto-componenti
- Gestire la logica di rendering condizionale
- Fornire la struttura HTML semantica (nav, aria-labels)

**NON fa:**
- ❌ Costruire breadcrumb items
- ❌ Gestire traduzioni
- ❌ Renderizzare UI degli items

**Dimensioni:** ~44 righe (da 160!)

---

### **2. humanize-slug.ts** - Utility Function
**Responsabilità:**
- Convertire kebab-case a Title Case
- Fornire fallback leggibile per slug non tradotti

**Input/Output:**
```typescript
humanizeSlug('my-new-page') → 'My New Page'
humanizeSlug('user-settings') → 'User Settings'
```

**Dimensioni:** ~15 righe

---

### **3. use-breadcrumb-items.ts** - Business Logic Hook
**Responsabilità:**
- Parsing del pathname
- Risoluzione intelligente delle traduzioni (3-tier strategy)
- Costruzione della struttura dati breadcrumb items
- Memoizzazione per performance

**Strategia di traduzione:**
1. Cerca in `navigation.{segment}`
2. Cerca in `breadcrumb.{segment}`
3. Fallback a `humanizeSlug(segment)`

**Dimensioni:** ~97 righe

---

### **4. breadcrumb-list.tsx** - List Container UI
**Responsabilità:**
- Renderizzare la lista `<ol>` con styling
- Iterare sugli items
- Gestire i separatori tra gli items

**Props:**
```typescript
interface BreadcrumbListProps {
  items: BreadcrumbItem[]
}
```

**Dimensioni:** ~24 righe

---

### **5. breadcrumb-item.tsx** - Single Item UI
**Responsabilità:**
- Renderizzare un singolo breadcrumb (link o span)
- Gestire l'icona Home
- Applicare stili appropriati (current page vs link)
- Gestire accessibilità (aria-current, aria-label)

**Props:**
```typescript
interface BreadcrumbItemProps {
  label: string
  href: string
  isCurrentPage: boolean
  isHome: boolean
}
```

**Dimensioni:** ~42 righe

---

### **6. breadcrumb-separator.tsx** - Separator UI
**Responsabilità:**
- Renderizzare l'icona ChevronRight
- Gestire accessibilità (aria-hidden)

**Dimensioni:** ~12 righe

---

### **7. index.ts** - Central Exports
**Responsabilità:**
- Esportare tutti i moduli pubblici
- Fornire un punto di accesso centralizzato
- Gestire type exports

**Dimensioni:** ~10 righe

---

## 📊 Benefici dell'Architettura SRP

### **Manutenibilità**
| Aspetto | Prima (Monolitico) | Dopo (SRP) |
|---------|-------------------|------------|
| Linee per file | 160 | 12-97 (media: ~35) |
| Responsabilità per modulo | 6+ | 1 |
| Modifiche isolate | No | Sì |
| Test unitari | Difficili | Facili |

### **Testabilità**
```typescript
// ✅ Test della logica (senza UI)
describe('useBreadcrumbItems', () => {
  it('should resolve translations correctly', () => {
    // Test puro della business logic
  })
})

// ✅ Test delle utility (pure functions)
describe('humanizeSlug', () => {
  it('should convert kebab-case to Title Case', () => {
    expect(humanizeSlug('my-page')).toBe('My Page')
  })
})

// ✅ Test UI components (isolati)
describe('BreadcrumbItem', () => {
  it('should render as link when not current', () => {
    // Test puro del rendering
  })
})
```

### **Riusabilità**
- `humanizeSlug`: utilizzabile ovunque serve conversione slug
- `useBreadcrumbItems`: riutilizzabile per breadcrumb alternativi
- `BreadcrumbItem`: riusabile in altri contesti di navigazione

### **Scalabilità**
Aggiungere nuove funzionalità è semplice:
- Nuovo separatore? → Crea `breadcrumb-separator-custom.tsx`
- Nuova strategia di traduzione? → Modifica solo `use-breadcrumb-items.ts`
- Nuovo stile item? → Crea `breadcrumb-item-compact.tsx`

---

## 🔄 Flusso dei Dati

```
┌─────────────────────────────────────────────────────────┐
│ breadcrumb.tsx (Orchestrator)                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Riceve locale                                    │ │
│ │ 2. Chiama useBreadcrumbItems({ locale })           │ │
│ │ 3. Riceve breadcrumbItems[]                        │ │
│ │ 4. Passa items a BreadcrumbList                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│ useBreadcrumbItems.ts (Logic)                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Usa usePathname() per path corrente             │ │
│ │ 2. Usa useTranslations() per traduzioni            │ │
│ │ 3. Parsifica path in segments                      │ │
│ │ 4. Per ogni segment:                               │ │
│ │    - getSegmentLabel() (3-tier strategy)           │ │
│ │      → navigation.{segment}                        │ │
│ │      → breadcrumb.{segment}                        │ │
│ │      → humanizeSlug(segment)                       │ │
│ │ 5. Costruisce BreadcrumbItem[]                     │ │
│ │ 6. Memoizza risultato                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BreadcrumbList (UI Container)                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Riceve items[]                                   │ │
│ │ 2. Itera su items con map()                        │ │
│ │ 3. Per ogni item (index > 0):                      │ │
│ │    → Renderizza BreadcrumbSeparator                │ │
│ │ 4. Per ogni item:                                   │ │
│ │    → Renderizza BreadcrumbItem                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BreadcrumbItem (UI Element)                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Riceve label, href, isCurrentPage, isHome       │ │
│ │ 2. Se isCurrentPage:                                │ │
│ │    → Renderizza <span> con aria-current="page"     │ │
│ │ 3. Altrimenti:                                      │ │
│ │    → Renderizza <Link> con hover styles            │ │
│ │ 4. Se isHome:                                       │ │
│ │    → Aggiunge icona Home                           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Esempi di Utilizzo

### Import del componente principale
```tsx
import { Breadcrumb } from '@/components/layout/breadcrumb'

export default function Layout({ locale }) {
  return (
    <>
      <Header />
      <Breadcrumb locale={locale} />
      <main>{children}</main>
    </>
  )
}
```

### Import di singoli moduli (se necessario)
```tsx
// Utility
import { humanizeSlug } from '@/components/layout/breadcrumb'

// Logic
import { useBreadcrumbItems } from '@/components/layout/breadcrumb'

// UI Components
import { BreadcrumbList, BreadcrumbItem } from '@/components/layout/breadcrumb'
```

### Estendere la funzionalità
```tsx
// Creare una variante custom
import { useBreadcrumbItems } from '@/components/layout/breadcrumb'

export function CompactBreadcrumb({ locale }) {
  const items = useBreadcrumbItems({ locale })
  
  // Mostra solo ultimo item e home
  const compactItems = [items[0], items[items.length - 1]]
  
  return <BreadcrumbList items={compactItems} />
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// humanize-slug.test.ts
describe('humanizeSlug', () => {
  it('converts single word', () => {
    expect(humanizeSlug('dashboard')).toBe('Dashboard')
  })
  
  it('converts kebab-case', () => {
    expect(humanizeSlug('privacy-policy')).toBe('Privacy Policy')
  })
  
  it('handles multiple hyphens', () => {
    expect(humanizeSlug('my-new-cool-page')).toBe('My New Cool Page')
  })
})
```

### Hook Tests
```typescript
// use-breadcrumb-items.test.ts
import { renderHook } from '@testing-library/react'
import { useBreadcrumbItems } from './use-breadcrumb-items'

describe('useBreadcrumbItems', () => {
  it('returns empty array for home page', () => {
    // Mock usePathname to return '/en'
    const { result } = renderHook(() => useBreadcrumbItems({ locale: 'en' }))
    expect(result.current).toEqual([])
  })
  
  it('constructs items for nested path', () => {
    // Mock usePathname to return '/en/admin/users'
    const { result } = renderHook(() => useBreadcrumbItems({ locale: 'en' }))
    expect(result.current).toHaveLength(3)
    expect(result.current[2].label).toBe('Users')
  })
})
```

### Component Tests
```typescript
// breadcrumb-item.test.tsx
import { render, screen } from '@testing-library/react'
import { BreadcrumbItem } from './breadcrumb-item'

describe('BreadcrumbItem', () => {
  it('renders as link when not current page', () => {
    render(
      <BreadcrumbItem 
        label="Dashboard" 
        href="/dashboard" 
        isCurrentPage={false}
        isHome={false}
      />
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard')
  })
  
  it('renders as span when current page', () => {
    render(
      <BreadcrumbItem 
        label="Settings" 
        href="/settings" 
        isCurrentPage={true}
        isHome={false}
      />
    )
    expect(screen.getByText('Settings')).toHaveAttribute('aria-current', 'page')
  })
})
```

---

## 📝 Maintenance Guide

### Aggiungere una nuova traduzione
```json
// messages/en.json
{
  "navigation": {
    "myNewPage": "My New Page"  // ← Aggiungere qui (auto-detected)
  }
}
```

### Modificare lo stile dei separatori
```tsx
// breadcrumb-separator.tsx
export const BreadcrumbSeparator = () => {
  return (
    <span className="text-muted-foreground">→</span>  // Cambia da ChevronRight a freccia
  )
}
```

### Aggiungere una nuova strategia di traduzione
```typescript
// use-breadcrumb-items.ts
const getSegmentLabel = (segment: string): string => {
  // 1. Navigation
  // 2. Breadcrumb
  // 3. Custom dictionary
  const customLabels = { /* ... */ }
  if (customLabels[segment]) return customLabels[segment]
  // 4. Humanize
  return humanizeSlug(segment)
}
```

---

## ✅ Checklist SRP Compliance

- [x] **Single Responsibility**: Ogni modulo ha una sola ragione per cambiare
- [x] **Separation of Concerns**: Logica separata da UI
- [x] **Pure Functions**: `humanizeSlug` è una pure function
- [x] **Hook per Business Logic**: `useBreadcrumbItems` gestisce solo logica
- [x] **Componenti Presentazionali**: UI components ricevono solo props
- [x] **Composizione**: Componente principale orchestra sottocomponenti
- [x] **Testabilità**: Ogni modulo testabile in isolamento
- [x] **Documentazione**: JSDoc e comments per ogni modulo

---

## 🚀 Performance Considerations

- **Memoization**: `useBreadcrumbItems` usa `useMemo` per evitare ricalcoli
- **Code Splitting**: Ogni modulo è importabile separatamente
- **Tree Shaking**: Exports granulari permettono tree shaking ottimale
- **Re-render Optimization**: Componenti puri evitano re-render inutili

---

## 📚 Riferimenti

- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle)
- [React Composition](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [WCAG Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

