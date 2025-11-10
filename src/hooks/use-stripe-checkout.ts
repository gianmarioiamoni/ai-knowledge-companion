/**
 * Stripe Checkout Hook
 * Handles creating and redirecting to Stripe checkout sessions
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getStripeClientPromise } from '@/lib/stripe/client'

export interface CheckoutParams {
  planName: 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
}

export interface UseStripeCheckoutReturn {
  createCheckoutSession: (params: CheckoutParams) => Promise<void>
  loading: boolean
  error: string | null
}

export function useStripeCheckout(): UseStripeCheckoutReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const locale = params?.locale || 'en'

  const createCheckoutSession = async (checkoutParams: CheckoutParams) => {
    setLoading(true)
    setError(null)

    try {
      // Call API to create checkout session (include locale)
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...checkoutParams,
          locale,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { sessionId, url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        // Fallback: use Stripe.js to redirect
        const stripe = await getStripeClientPromise()
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        })

        if (stripeError) {
          throw new Error(stripeError.message)
        }
      }
    } catch (err) {
      const error = err as Error
      console.error('Checkout error:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    loading,
    error,
  }
}

