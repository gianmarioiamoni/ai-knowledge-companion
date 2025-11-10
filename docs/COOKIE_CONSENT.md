# Cookie Consent System

## Overview

The application implements a GDPR-compliant cookie consent system that allows users to control which types of cookies they want to accept.

## Features

✅ **GDPR Compliant**
- Clear information about cookie usage
- Granular control over cookie categories
- Ability to accept, reject, or customize
- Persistent consent storage
- Automatic expiry after 1 year

✅ **User-Friendly**
- Non-intrusive banner design
- Easy accept/reject all buttons
- Detailed customization modal
- Multi-language support (EN/IT)

✅ **Developer-Friendly**
- Type-safe cookie utilities
- Event-driven consent changes
- Easy integration with analytics
- LocalStorage-based (no server required)

---

## Cookie Categories

### 1. Necessary Cookies (Always On)
**Purpose**: Essential for website functionality
**Examples**: Authentication, security, session management
**User Control**: Cannot be disabled

### 2. Analytics Cookies (Optional)
**Purpose**: Understand user behavior and improve the site
**Examples**: Google Analytics, Plausible Analytics
**User Control**: Can be enabled/disabled

### 3. Preferences Cookies (Optional)
**Purpose**: Remember user choices and settings
**Examples**: Language preference, theme selection, layout
**User Control**: Can be enabled/disabled

### 4. Marketing Cookies (Optional)
**Purpose**: Track users for advertising purposes
**Examples**: Google Ads, Facebook Pixel, remarketing
**User Control**: Can be enabled/disabled

---

## Architecture

### File Structure

```
src/
├── lib/
│   └── utils/
│       └── cookies.ts               # Cookie utilities and types
├── components/
│   └── cookies/
│       ├── cookie-consent-banner.tsx # Main banner component
│       └── index.ts                  # Exports
└── app/
    └── [locale]/
        └── layout.tsx                # Banner integration

messages/
├── en.json                           # English translations
└── it.json                           # Italian translations
```

### Component Flow

```
1. User visits site
   ↓
2. Check if consent exists (localStorage)
   ↓
3a. Consent exists → Initialize analytics → Hide banner
   ↓
3b. No consent → Show banner
   ↓
4. User makes choice:
   - Accept All → Save all categories
   - Reject All → Save only necessary
   - Customize → Show modal → User selects → Save
   ↓
5. Initialize analytics based on consent
   ↓
6. Hide banner
```

---

## Usage

### Check if User Has Given Consent

```typescript
import { hasConsent, getConsent } from '@/lib/utils/cookies'

const userHasConsent = hasConsent()

if (userHasConsent) {
  const consent = getConsent()
  console.log('Analytics enabled:', consent?.analytics)
}
```

### Check Specific Cookie Type

```typescript
import { isConsentGiven } from '@/lib/utils/cookies'

if (isConsentGiven('analytics')) {
  // Initialize Google Analytics
  initGA()
}

if (isConsentGiven('marketing')) {
  // Initialize Facebook Pixel
  initFBPixel()
}
```

### Save Custom Consent

```typescript
import { saveConsent, type CookieConsent } from '@/lib/utils/cookies'

const customConsent: CookieConsent = {
  necessary: true,      // Always true
  analytics: true,      // User enabled
  preferences: false,   // User disabled
  marketing: false,     // User disabled
  timestamp: Date.now(),
  version: '1.0',
}

saveConsent(customConsent)
```

### Listen to Consent Changes

```typescript
// In your component or analytics initialization
useEffect(() => {
  const handleConsentChange = (event: CustomEvent) => {
    const consent = event.detail as CookieConsent | null
    
    if (consent?.analytics) {
      // Initialize analytics
    } else {
      // Disable analytics
    }
  }

  window.addEventListener('cookie-consent-changed', handleConsentChange as EventListener)

  return () => {
    window.removeEventListener('cookie-consent-changed', handleConsentChange as EventListener)
  }
}, [])
```

### Clear Consent (for Testing)

```typescript
import { clearConsent } from '@/lib/utils/cookies'

// Clear consent and show banner again
clearConsent()
```

---

## Integration with Analytics

### Google Analytics Example

```typescript
// src/lib/analytics/google-analytics.ts
import { isConsentGiven } from '@/lib/utils/cookies'

export function initGoogleAnalytics() {
  if (!isConsentGiven('analytics')) {
    console.log('Analytics consent not given')
    return
  }

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  if (!GA_ID) return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  gtag('js', new Date())
  gtag('config', GA_ID)

  console.log('✅ Google Analytics initialized')
}

// Listen for consent changes
window.addEventListener('cookie-consent-changed', (event: CustomEvent) => {
  const consent = event.detail
  
  if (consent?.analytics) {
    initGoogleAnalytics()
  } else {
    // Disable analytics if previously enabled
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }
})
```

### Plausible Analytics Example (Privacy-Friendly)

```typescript
// src/lib/analytics/plausible.ts
import { isConsentGiven } from '@/lib/utils/cookies'

export function initPlausible() {
  // Plausible is privacy-friendly and doesn't require consent in some jurisdictions
  // But we still respect user choice
  if (!isConsentGiven('analytics')) {
    console.log('Analytics consent not given')
    return
  }

  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = 'your-domain.com'
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)

  console.log('✅ Plausible Analytics initialized')
}
```

---

## Customization

### Change Consent Expiry

```typescript
// In src/lib/utils/cookies.ts
const CONSENT_EXPIRY_DAYS = 365  // Change to desired days
```

### Update Consent Version

When you make significant changes to your cookie policy:

```typescript
// In src/lib/utils/cookies.ts
const CONSENT_VERSION = '2.0'  // Increment version
```

This will invalidate all existing consents and require users to consent again.

### Customize Banner Appearance

The banner uses Tailwind CSS and shadcn/ui components. Customize in:
- `src/components/cookies/cookie-consent-banner.tsx`

```tsx
// Example: Change banner position
<div className="fixed top-0 left-0 right-0 ...">  // Top instead of bottom
```

### Add/Remove Cookie Categories

1. Update `CookieConsent` type in `src/lib/utils/cookies.ts`
2. Add translation keys in `messages/en.json` and `messages/it.json`
3. Add switch in `cookie-consent-banner.tsx` modal

---

## GDPR Compliance Checklist

- [x] **Transparency**: Clear information about what cookies are used
- [x] **Consent**: User must actively consent (no pre-ticked boxes)
- [x] **Granularity**: Users can choose specific cookie categories
- [x] **Easy to withdraw**: Clear way to reject or customize
- [x] **No cookie walls**: Site works with only necessary cookies
- [x] **Storage**: Consent stored locally (no tracking before consent)
- [x] **Expiry**: Consent expires after reasonable time (1 year)
- [x] **Versioning**: Re-consent required when policy changes
- [ ] **Privacy Policy**: Link to privacy policy (TODO: create page)

---

## Testing

### Test the Banner

1. **Clear localStorage** to reset consent:
   ```javascript
   localStorage.removeItem('cookie_consent')
   ```

2. **Reload page** - Banner should appear

3. **Test "Accept All"**:
   - Click "Accept All"
   - Check localStorage: `localStorage.getItem('cookie_consent')`
   - Should show all categories as `true`

4. **Test "Reject All"**:
   - Clear localStorage
   - Reload page
   - Click "Necessary Only"
   - Check localStorage
   - Only `necessary` should be `true`

5. **Test "Customize"**:
   - Clear localStorage
   - Reload page
   - Click "Customize"
   - Toggle categories
   - Click "Save Preferences"
   - Check localStorage matches your selections

6. **Test Persistence**:
   - Make a choice
   - Reload page
   - Banner should NOT appear
   - Navigate to different pages
   - Banner should stay hidden

7. **Test Expiry** (optional):
   ```javascript
   // Manually set old timestamp
   const consent = JSON.parse(localStorage.getItem('cookie_consent'))
   consent.timestamp = Date.now() - (366 * 24 * 60 * 60 * 1000) // 366 days ago
   localStorage.setItem('cookie_consent', JSON.stringify(consent))
   // Reload - banner should appear (consent expired)
   ```

8. **Test Version Update**:
   - Change `CONSENT_VERSION` in `cookies.ts`
   - Reload page
   - Banner should appear again (new consent required)

### Test Multi-Language

1. Switch to Italian: `/it`
2. Clear localStorage
3. Banner should show Italian text
4. Switch to English: `/en`
5. Banner should show English text

---

## Troubleshooting

### Banner Doesn't Appear

1. Check browser console for errors
2. Verify localStorage is not blocked
3. Check if consent already exists: `localStorage.getItem('cookie_consent')`
4. Clear consent: `localStorage.removeItem('cookie_consent')`

### Banner Appears Every Time

1. Check browser is allowing localStorage
2. Check for browser extensions blocking cookies/storage
3. Verify consent is being saved: `localStorage.getItem('cookie_consent')`

### Translations Not Working

1. Verify translation keys exist in both `messages/en.json` and `messages/it.json`
2. Check `NextIntlClientProvider` wraps the component
3. Verify locale is passed correctly

### Analytics Not Initializing

1. Check consent is given: `isConsentGiven('analytics')`
2. Verify analytics code is listening to `cookie-consent-changed` event
3. Check browser console for analytics errors

---

## Best Practices

1. **Privacy First**
   - Don't load analytics/marketing scripts before consent
   - Respect user's choices strictly
   - Provide clear opt-out

2. **Performance**
   - Banner uses CSS animations (smooth)
   - LocalStorage only (no network requests)
   - Lazy-load analytics after consent

3. **UX**
   - Banner is non-blocking
   - Easy to dismiss
   - Clear language
   - Mobile-friendly

4. **Maintenance**
   - Review cookie list regularly
   - Update privacy policy when adding new cookies
   - Test consent flow after updates

---

## Future Enhancements

- [ ] Add "Privacy Policy" page and link from banner
- [ ] Add "Cookie Settings" page in user profile
- [ ] Remember scroll position when modal opens
- [ ] Add cookie usage statistics dashboard
- [ ] Support for more languages
- [ ] Integration with Consent Management Platform (CMP)
- [ ] Server-side consent tracking (optional)

---

## References

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO Cookie Guidance](https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies/)
- [EU Cookie Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009L0136)

---

**Status**: ✅ Implemented and Ready for Production  
**GDPR Compliant**: ✅ Yes  
**Multi-Language**: ✅ English & Italian

