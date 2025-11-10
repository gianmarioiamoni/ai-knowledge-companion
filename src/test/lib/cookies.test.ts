/**
 * Cookie Consent Utilities Tests
 */

import {
  hasConsent,
  getConsent,
  saveConsent,
  clearConsent,
  getAllConsent,
  getDefaultConsent,
  isConsentGiven,
  type CookieConsent,
} from '@/lib/utils/cookies';

describe('Cookie Consent Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('hasConsent', () => {
    it('should return false when no consent exists', () => {
      expect(hasConsent()).toBe(false);
    });

    it('should return true when consent exists', () => {
      const consent = getDefaultConsent();
      saveConsent(consent);
      expect(hasConsent()).toBe(true);
    });
  });

  describe('getDefaultConsent', () => {
    it('should return consent with only necessary cookies enabled', () => {
      const consent = getDefaultConsent();
      
      expect(consent.necessary).toBe(true);
      expect(consent.analytics).toBe(false);
      expect(consent.marketing).toBe(false);
      expect(consent.preferences).toBe(false);
      expect(consent.version).toBe('1.0');
      expect(consent.timestamp).toBeGreaterThan(0);
    });
  });

  describe('getAllConsent', () => {
    it('should return consent with all cookies enabled', () => {
      const consent = getAllConsent();
      
      expect(consent.necessary).toBe(true);
      expect(consent.analytics).toBe(true);
      expect(consent.marketing).toBe(true);
      expect(consent.preferences).toBe(true);
    });
  });

  describe('saveConsent and getConsent', () => {
    it('should save and retrieve consent correctly', () => {
      const consent = getAllConsent();
      saveConsent(consent);
      
      const retrieved = getConsent();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.analytics).toBe(true);
      expect(retrieved?.marketing).toBe(true);
    });

    it('should always set necessary to true when saving', () => {
      const consent: CookieConsent = {
        necessary: false,  // Try to set to false
        analytics: true,
        marketing: false,
        preferences: true,
        timestamp: Date.now(),
        version: '1.0',
      };
      
      saveConsent(consent);
      const retrieved = getConsent();
      
      expect(retrieved?.necessary).toBe(true);  // Should be forced to true
    });

    it('should return null when consent does not exist', () => {
      expect(getConsent()).toBeNull();
    });
  });

  describe('clearConsent', () => {
    it('should remove consent from storage', () => {
      const consent = getAllConsent();
      saveConsent(consent);
      
      expect(hasConsent()).toBe(true);
      
      clearConsent();
      
      expect(hasConsent()).toBe(false);
      expect(getConsent()).toBeNull();
    });
  });

  describe('isConsentGiven', () => {
    it('should return false when no consent exists', () => {
      expect(isConsentGiven('analytics')).toBe(false);
    });

    it('should return correct value for each cookie type', () => {
      const consent: CookieConsent = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
        timestamp: Date.now(),
        version: '1.0',
      };
      
      saveConsent(consent);
      
      expect(isConsentGiven('necessary')).toBe(true);
      expect(isConsentGiven('analytics')).toBe(true);
      expect(isConsentGiven('marketing')).toBe(false);
      expect(isConsentGiven('preferences')).toBe(true);
    });
  });

  describe('consent expiry', () => {
    it('should return null for expired consent', () => {
      const consent = getAllConsent();
      saveConsent(consent);
      
      // Manually set expired timestamp (366 days ago)
      const stored = localStorage.getItem('cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.timestamp = Date.now() - (366 * 24 * 60 * 60 * 1000);
        localStorage.setItem('cookie_consent', JSON.stringify(parsed));
      }
      
      expect(getConsent()).toBeNull();
    });

    it('should return consent for non-expired consent', () => {
      const consent = getAllConsent();
      saveConsent(consent);
      
      // Manually set recent timestamp (1 day ago)
      const stored = localStorage.getItem('cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.timestamp = Date.now() - (1 * 24 * 60 * 60 * 1000);
        localStorage.setItem('cookie_consent', JSON.stringify(parsed));
      }
      
      expect(getConsent()).not.toBeNull();
    });
  });

  describe('consent versioning', () => {
    it('should return null for outdated consent version', () => {
      const consent = getAllConsent();
      saveConsent(consent);
      
      // Manually set old version
      const stored = localStorage.getItem('cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.version = '0.9';  // Old version
        localStorage.setItem('cookie_consent', JSON.stringify(parsed));
      }
      
      expect(getConsent()).toBeNull();
    });
  });
});

