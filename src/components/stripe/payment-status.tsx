/**
 * Payment Status Component
 * Single Responsibility: Display payment result messages
 */

'use client'

import { JSX, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Info, DollarSign } from 'lucide-react'
import { useProrationInfo } from '@/hooks/use-proration-info'

type PaymentStatus = 'success' | 'cancelled' | 'failed' | null

export function PaymentStatus(): JSX.Element | null {
  const t = useTranslations('plans.payment')
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<PaymentStatus>(null)
  const { prorationInfo } = useProrationInfo()

  useEffect(() => {
    const paymentParam = searchParams.get('payment')
    
    if (paymentParam === 'success' || paymentParam === 'cancelled' || paymentParam === 'failed') {
      setStatus(paymentParam)

      // Auto-dismiss success message after 5 seconds
      if (paymentParam === 'success') {
        const timer = setTimeout(() => {
          clearPaymentParam()
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [searchParams])

  const clearPaymentParam = () => {
    setStatus(null)
    // Remove payment param from URL without reload
    const params = new URLSearchParams(searchParams.toString())
    params.delete('payment')
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl)
  }

  if (!status && !prorationInfo) {
    return null
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Proration notification (shown for upgrades) */}
      {prorationInfo && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-600">
            {t('prorationTitle') || 'Prorated Charge Applied'}
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            {t('prorationDescription')
              ?.replace('{amount}', `${prorationInfo.amount.toFixed(2)}`)
              ?.replace('{currency}', prorationInfo.currency) || 
              `You've been charged ${prorationInfo.currency} ${prorationInfo.amount.toFixed(2)} for the remaining days of this billing cycle.`
            }
          </AlertDescription>
        </Alert>
      )}
      
      {/* Payment status messages */}
      {status === 'success' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">{t('success')}</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your subscription has been activated successfully. You now have access to all premium features!
          </AlertDescription>
        </Alert>
      )}

      {status === 'cancelled' && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">{t('cancelled')}</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            Your payment was cancelled. You can try again anytime.
          </AlertDescription>
        </Alert>
      )}

      {status === 'failed' && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">{t('failed')}</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            {t('error.generic')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

