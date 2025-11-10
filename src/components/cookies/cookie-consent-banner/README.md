# Cookie Consent Banner Components

This directory contains the sub-components for the Cookie Consent Banner, organized following the **Single Responsibility Principle (SRP)**.

## Architecture

```
src/components/cookies/
├── cookie-consent-banner.tsx          # Main orchestrator component
├── cookie-consent-banner/
│   ├── use-cookie-consent.ts          # Logic: State & handlers
│   ├── cookie-banner.tsx              # UI: Bottom banner
│   ├── cookie-preferences-modal.tsx   # UI: Preferences modal
│   ├── cookie-category-item.tsx       # UI: Single category
│   ├── index.ts                       # Exports
│   └── README.md                      # This file
└── index.ts                           # Main exports
```

## Components

### 1. **useCookieConsent** (Hook - Logic)
**File**: `use-cookie-consent.ts`  
**Responsibility**: Manage cookie consent state and business logic

**Features**:
- ✅ Check if user has given consent
- ✅ Initialize analytics on mount
- ✅ Handle accept all / reject all
- ✅ Handle customize modal
- ✅ Toggle individual preferences
- ✅ Save consent to localStorage

**Returns**:
```typescript
{
  showBanner: boolean
  showModal: boolean
  preferences: CookieConsent
  handleAcceptAll: () => void
  handleRejectAll: () => void
  handleCustomize: () => void
  handleSavePreferences: () => void
  handleTogglePreference: (key) => void
  handleCloseModal: () => void
}
```

**Usage**:
```typescript
const {
  showBanner,
  handleAcceptAll,
  // ... other handlers
} = useCookieConsent()
```

---

### 2. **CookieBanner** (UI Component)
**File**: `cookie-banner.tsx`  
**Responsibility**: Render the bottom banner UI

**Props**:
```typescript
{
  onAcceptAll: () => void
  onRejectAll: () => void
  onCustomize: () => void
}
```

**Features**:
- ✅ Fixed bottom position
- ✅ Gradient background
- ✅ Three action buttons
- ✅ Close button (X)
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)

**UI Structure**:
```
┌────────────────────────────────────────┐
│ 🍪 Cookie Consent              [X]     │
│ We use cookies...                      │
│ [Accept All] [Necessary] [Customize]  │
└────────────────────────────────────────┘
```

---

### 3. **CookiePreferencesModal** (UI Component)
**File**: `cookie-preferences-modal.tsx`  
**Responsibility**: Render preferences modal with all categories

**Props**:
```typescript
{
  open: boolean
  preferences: CookieConsent
  onClose: () => void
  onSave: () => void
  onToggle: (key: keyof CookieConsent) => void
}
```

**Features**:
- ✅ Dialog/Modal UI
- ✅ Lists all 4 cookie categories
- ✅ Uses `CookieCategoryItem` for each
- ✅ Save/Close buttons
- ✅ Scrollable content
- ✅ Responsive

**Categories**:
1. Necessary (always on, disabled)
2. Analytics (toggle)
3. Preferences (toggle)
4. Marketing (toggle)

---

### 4. **CookieCategoryItem** (UI Component)
**File**: `cookie-category-item.tsx`  
**Responsibility**: Render a single cookie category with toggle

**Props**:
```typescript
{
  categoryKey: 'necessary' | 'analytics' | 'preferences' | 'marketing'
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}
```

**Features**:
- ✅ Category title
- ✅ Description text
- ✅ Examples (if available)
- ✅ Toggle switch
- ✅ Special handling for "necessary" (always on)
- ✅ Conditional border-top

**UI Structure**:
```
┌────────────────────────────────────────┐
│ Analytics Cookies              [ON]    │
│ These cookies help us...               │
│ Examples: Google Analytics             │
└────────────────────────────────────────┘
```

---

### 5. **CookieConsentBanner** (Main Orchestrator)
**File**: `../cookie-consent-banner.tsx`  
**Responsibility**: Coordinate banner and modal components

**Features**:
- ✅ Uses `useCookieConsent` hook
- ✅ Renders `CookieBanner`
- ✅ Renders `CookiePreferencesModal`
- ✅ Passes handlers to children
- ✅ Conditional rendering (only if no consent)

**Code**:
```typescript
export function CookieConsentBanner() {
  const {
    showBanner,
    showModal,
    preferences,
    // ... handlers
  } = useCookieConsent()

  if (!showBanner) return null

  return (
    <>
      <CookieBanner onAcceptAll={...} />
      <CookiePreferencesModal open={showModal} />
    </>
  )
}
```

---

## SRP Benefits

### Before (Monolithic)
- ❌ 274 lines in one file
- ❌ Mixed logic and UI
- ❌ Hard to test
- ❌ Hard to reuse
- ❌ Difficult to maintain

### After (SRP Applied)
- ✅ Each component has single responsibility
- ✅ Logic separated in hook
- ✅ UI components are presentational
- ✅ Easy to test each part
- ✅ Easy to reuse components
- ✅ Clear dependencies
- ✅ Better code organization

---

## File Sizes (Approximate)

| File | Lines | Responsibility |
|------|-------|----------------|
| `use-cookie-consent.ts` | ~90 | Logic/State |
| `cookie-banner.tsx` | ~70 | Banner UI |
| `cookie-preferences-modal.tsx` | ~80 | Modal UI |
| `cookie-category-item.tsx` | ~60 | Category UI |
| `cookie-consent-banner.tsx` | ~40 | Orchestration |
| **Total** | **~340** | (vs 274 before) |

*Note: Slight increase in LOC due to better organization and exports*

---

## Testing Strategy

### Unit Tests

**Hook (`use-cookie-consent.ts`)**:
```typescript
describe('useCookieConsent', () => {
  it('should initialize with no consent', () => {})
  it('should handle accept all', () => {})
  it('should toggle preferences', () => {})
})
```

**Components**:
```typescript
describe('CookieBanner', () => {
  it('should render all buttons', () => {})
  it('should call onAcceptAll when clicked', () => {})
})

describe('CookieCategoryItem', () => {
  it('should render category info', () => {})
  it('should toggle when switch is clicked', () => {})
  it('should disable necessary category', () => {})
})
```

### Integration Tests
```typescript
describe('CookieConsentBanner', () => {
  it('should show banner when no consent', () => {})
  it('should hide banner after accept', () => {})
  it('should open modal on customize', () => {})
  it('should save preferences', () => {})
})
```

---

## Usage Examples

### Use Main Component
```typescript
// In layout.tsx
import { CookieConsentBanner } from '@/components/cookies'

export default function Layout() {
  return (
    <>
      {children}
      <CookieConsentBanner />
    </>
  )
}
```

### Use Individual Components (if needed)
```typescript
// Custom implementation
import { 
  useCookieConsent,
  CookieBanner 
} from '@/components/cookies/cookie-consent-banner'

export function CustomCookieFlow() {
  const { handleAcceptAll, ... } = useCookieConsent()
  
  return <CookieBanner onAcceptAll={handleAcceptAll} />
}
```

### Use Hook Only
```typescript
// For programmatic control
import { useCookieConsent } from '@/components/cookies/cookie-consent-banner'

export function MyComponent() {
  const { preferences, handleAcceptAll } = useCookieConsent()
  
  // Custom UI or logic
}
```

---

## Maintenance

### Add New Cookie Category

1. **Update types** in `src/lib/utils/cookies.ts`:
```typescript
export interface CookieConsent {
  // ... existing
  newCategory: boolean
}
```

2. **Add translations** in `messages/*.json`:
```json
{
  "cookies": {
    "categories": {
      "newCategory": {
        "title": "...",
        "description": "...",
        "examples": "..."
      }
    }
  }
}
```

3. **Add to modal** in `cookie-preferences-modal.tsx`:
```tsx
<CookieCategoryItem
  categoryKey="newCategory"
  checked={preferences.newCategory}
  onToggle={() => onToggle('newCategory')}
/>
```

### Change Banner Position

In `cookie-banner.tsx`, change wrapper class:
```tsx
// Top instead of bottom
<div className="fixed top-0 left-0 right-0 ...">
```

### Customize Styles

All components use Tailwind CSS and shadcn/ui. Customize directly in component files.

---

## Dependencies

- **React**: Hooks (useState, useEffect)
- **next-intl**: Translations
- **lucide-react**: Icons
- **shadcn/ui**: UI components (Button, Card, Dialog, Switch, Label)
- **@/lib/utils/cookies**: Cookie utilities

---

## Best Practices

1. **Keep components small**: Each component should be < 100 lines
2. **Separate logic from UI**: Use hooks for logic
3. **Single responsibility**: Each component does one thing
4. **Props over hooks**: Pass data via props when possible
5. **Test each component**: Unit + integration tests
6. **Document changes**: Update this README when adding features

---

## Related Files

- `src/lib/utils/cookies.ts` - Cookie utilities and types
- `messages/en.json` - English translations
- `messages/it.json` - Italian translations
- `docs/COOKIE_CONSENT.md` - Full documentation

---

**Refactored**: ✅ SRP Applied  
**Tested**: ✅ No Linter Errors  
**Documented**: ✅ This README

🍪 Components are now clean, testable, and maintainable!

