/**
 * Cookie Consent Logic Hook
 * Manages cookie consent state and handlers
 */

import { useState, useEffect } from 'react'
import {
  hasConsent,
  getConsent,
  saveConsent,
  getAllConsent,
  getDefaultConsent,
  initializeAnalytics,
  type CookieConsent,
} from '@/lib/utils/cookies'

interface UseCookieConsentReturn {
  showBanner: boolean
  showModal: boolean
  preferences: CookieConsent
  handleAcceptAll: () => void
  handleRejectAll: () => void
  handleCustomize: () => void
  handleSavePreferences: () => void
  handleTogglePreference: (key: keyof CookieConsent) => void
  handleCloseModal: () => void
}

export function useCookieConsent(): UseCookieConsentReturn {
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [preferences, setPreferences] = useState<CookieConsent>(getDefaultConsent())

  useEffect(() => {
    // Check if user has already given consent
    const hasGivenConsent = hasConsent()
    setShowBanner(!hasGivenConsent)

    // If consent exists, initialize analytics
    if (hasGivenConsent) {
      const existingConsent = getConsent()
      if (existingConsent) {
        initializeAnalytics(existingConsent)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const consent = getAllConsent()
    saveConsent(consent)
    initializeAnalytics(consent)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const consent = getDefaultConsent()
    saveConsent(consent)
    initializeAnalytics(consent)
    setShowBanner(false)
  }

  const handleCustomize = () => {
    setShowModal(true)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
    initializeAnalytics(preferences)
    setShowModal(false)
    setShowBanner(false)
  }

  const handleTogglePreference = (key: keyof CookieConsent) => {
    if (key === 'necessary' || key === 'timestamp' || key === 'version') {
      return // Cannot toggle these
    }

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return {
    showBanner,
    showModal,
    preferences,
    handleAcceptAll,
    handleRejectAll,
    handleCustomize,
    handleSavePreferences,
    handleTogglePreference,
    handleCloseModal,
  }
}

