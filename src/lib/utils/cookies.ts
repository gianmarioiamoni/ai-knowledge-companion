/**
 * Cookie Consent Utilities
 * GDPR-compliant cookie management
 */

export type CookieConsentType = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface CookieConsent {
  necessary: boolean;      // Always true (required for app functionality)
  analytics: boolean;      // Google Analytics, Plausible, etc.
  marketing: boolean;      // Marketing cookies, ads
  preferences: boolean;    // User preferences, language, theme
  timestamp: number;       // When consent was given
  version: string;         // Consent version for updates
}

const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365;

/**
 * Get default cookie consent (all false except necessary)
 */
export function getDefaultConsent(): CookieConsent {
  return {
    necessary: true,     // Always required
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
}

/**
 * Get all cookies consent (user accepts all)
 */
export function getAllConsent(): CookieConsent {
  return {
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
}

/**
 * Check if user has given cookie consent
 */
export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    return consent !== null;
  } catch {
    return false;
  }
}

/**
 * Get current cookie consent settings
 */
export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (!consent) return null;
    
    const parsed = JSON.parse(consent) as CookieConsent;
    
    // Check if consent version is outdated
    if (parsed.version !== CONSENT_VERSION) {
      return null; // Require new consent
    }
    
    // Check if consent is expired (1 year)
    const now = Date.now();
    const expiryTime = parsed.timestamp + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (now > expiryTime) {
      return null; // Require new consent
    }
    
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save cookie consent settings
 */
export function saveConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Always ensure necessary cookies are enabled
    const finalConsent: CookieConsent = {
      ...consent,
      necessary: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(finalConsent));
    
    // Trigger custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', {
      detail: finalConsent,
    }));
  } catch (error) {
    console.error('Failed to save cookie consent:', error);
  }
}

/**
 * Clear cookie consent (for testing or user request)
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONSENT_COOKIE_NAME);
    
    // Trigger event
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', {
      detail: null,
    }));
  } catch (error) {
    console.error('Failed to clear cookie consent:', error);
  }
}

/**
 * Check if specific cookie type is allowed
 */
export function isConsentGiven(type: CookieConsentType): boolean {
  const consent = getConsent();
  if (!consent) return false;
  
  return consent[type];
}

/**
 * Initialize analytics based on consent
 * Call this after consent is given
 */
export function initializeAnalytics(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;
  
  // Google Analytics
  if (consent.analytics && process.env.NEXT_PUBLIC_GA_ID) {
    // Initialize Google Analytics
    // Example: gtag('consent', 'update', { analytics_storage: 'granted' });
    console.log('Analytics enabled');
  }
  
  // Marketing/Advertising
  if (consent.marketing) {
    // Initialize marketing cookies
    console.log('Marketing cookies enabled');
  }
  
  // Preferences
  if (consent.preferences) {
    // Enable preference cookies (theme, language already handled separately)
    console.log('Preference cookies enabled');
  }
}

/**
 * Get consent expiry date
 */
export function getConsentExpiryDate(): Date | null {
  const consent = getConsent();
  if (!consent) return null;
  
  const expiryTime = consent.timestamp + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return new Date(expiryTime);
}

