/**
 * Cookie Consent Banner (Main Component)
 * Orchestrates cookie consent flow with banner and modal
 */

'use client'

import { JSX } from 'react'
import { useCookieConsent } from './cookie-consent-banner/use-cookie-consent'
import { CookieBanner } from './cookie-consent-banner/cookie-banner'
import { CookiePreferencesModal } from './cookie-consent-banner/cookie-preferences-modal'

export function CookieConsentBanner(): JSX.Element | null {
  const {
    showBanner,
    showModal,
    preferences,
    handleAcceptAll,
    handleRejectAll,
    handleCustomize,
    handleSavePreferences,
    handleTogglePreference,
    handleCloseModal,
  } = useCookieConsent()

  if (!showBanner) {
    return null
  }

  return (
    <>
      <CookieBanner
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
        onCustomize={handleCustomize}
      />

      <CookiePreferencesModal
        open={showModal}
        preferences={preferences}
        onClose={handleCloseModal}
        onSave={handleSavePreferences}
        onToggle={handleTogglePreference}
      />
    </>
  )
}
