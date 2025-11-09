/**
 * Stripe Customer Portal Hook
 * Handles redirecting to Stripe Customer Portal for subscription management
 */

import { useState } from 'react'

export interface UseStripePortalReturn {
  openCustomerPortal: () => Promise<void>
  loading: boolean
  error: string | null
}

export function useStripePortal(): UseStripePortalReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCustomerPortal = async () => {
    setLoading(true)
    setError(null)

    try {
      // Call API to create portal session
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create portal session')
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error('No portal URL returned')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (err) {
      const error = err as Error
      console.error('Portal error:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  return {
    openCustomerPortal,
    loading,
    error,
  }
}

