/**
 * Stripe Test Mode Banner
 * 
 * Displays a warning banner when Stripe is in test mode
 * Automatically hidden in production (when using live keys)
 */

'use client'

import { JSX } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StripeTestModeBannerProps {
  isTestMode: boolean
}

export function StripeTestModeBanner({ isTestMode }: StripeTestModeBannerProps): JSX.Element | null {
  const t = useTranslations('plans')
  
  // Don't render anything if not in test mode
  if (!isTestMode) {
    return null
  }

  return (
    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {t('testMode.title', { defaultValue: 'Stripe Test Mode Active' })}
          </p>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            {t('testMode.description', {
              defaultValue: 'You are in Stripe test mode. Use test card 4242 4242 4242 4242 to simulate payments. No real charges will be made.'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

