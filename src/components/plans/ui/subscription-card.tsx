/**
 * Subscription Card Component - Display subscription info in profile
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useState } from 'react'

export function SubscriptionCard(): JSX.Element {
  const t = useTranslations('plans.subscription')
  const router = useRouter()
  const { subscription, loading, cancelSubscription } = useSubscription()
  const [cancelling, setCancelling] = useState(false)

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const result = await cancelSubscription()
      if (result.success) {
        toast.success(result.message || t('../cancelSuccess'))
      } else {
        toast.error(result.error || t('../cancelError'))
      }
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {t('title')}
          </CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/plans')}>
            {t('upgradePlan')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const statusColors = {
    active: 'bg-green-500',
    trial: 'bg-blue-500',
    cancelled: 'bg-yellow-500',
    expired: 'bg-red-500'
  }

  const statusLabels = {
    active: t('statusActive'),
    trial: t('statusTrial'),
    cancelled: t('statusCancelled'),
    expired: t('statusExpired')
  }

  // Calculate usage percentages
  const tutorUsage = subscription.max_tutors === -1 ? 0 : 0 // Would need current usage data
  const documentUsage = 0 // Would need current usage data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('title')}
            </CardTitle>
            <CardDescription className="mt-2">
              {subscription.plan_display_name} - {subscription.billing_cycle ? 
                (subscription.billing_cycle === 'monthly' ? t('../monthly') : t('../yearly')) 
                : t('statusTrial')
              }
            </CardDescription>
          </div>
          <Badge className={statusColors[subscription.status as keyof typeof statusColors]}>
            {statusLabels[subscription.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subscription Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {subscription.status === 'trial' ? t('expiresOn') : t('nextPayment')}
            </div>
            <div className="font-medium">
              {new Date(subscription.end_date).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('daysRemaining', { days: subscription.days_remaining })}
            </div>
          </div>

          {subscription.status !== 'trial' && subscription.billing_cycle && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('billingCycle')}
              </div>
              <div className="font-medium capitalize">
                {subscription.billing_cycle === 'monthly' ? t('../monthly') : t('../yearly')}
              </div>
            </div>
          )}
        </div>

        {/* Plan Limits */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">{t('usage.title')}</h4>
          
          {/* Tutors */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('../features.tutors')}</span>
              <span className="font-medium">
                {subscription.max_tutors === -1 ? t('usage.unlimited') : `0 / ${subscription.max_tutors}`}
              </span>
            </div>
            {subscription.max_tutors !== -1 && (
              <Progress value={tutorUsage} className="h-2" />
            )}
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('../features.documents')}</span>
              <span className="font-medium">
                {subscription.max_documents === -1 ? t('usage.unlimited') : `0 / ${subscription.max_documents}`}
              </span>
            </div>
            {subscription.max_documents !== -1 && (
              <Progress value={documentUsage} className="h-2" />
            )}
          </div>

          {/* Audio Files */}
          {subscription.max_audio_files > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('../features.audioFiles')}</span>
                <span className="font-medium">
                  0 / {subscription.max_audio_files}
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          variant="default" 
          className="flex-1"
          onClick={() => router.push('/plans')}
        >
          {t('changePlan')}
        </Button>
        
        {subscription.status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1" disabled={cancelling}>
                {cancelling ? <LoadingSpinner size="sm" /> : t('cancelPlan')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmCancel')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('confirmCancelDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('../../../common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelSubscription}>
                  {t('confirmButton')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  )
}

