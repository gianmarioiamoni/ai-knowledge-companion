/**
 * Subscription Actions Component - Change plan and cancel buttons
 */

import { JSX } from 'react'
import { useRouter } from '@/i18n/navigation'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

interface SubscriptionActionsProps {
  status: string
  cancelling: boolean
  onCancel: () => void
  changePlanText: string
  cancelPlanText: string
  confirmCancelTitle: string
  confirmCancelDesc: string
  confirmButtonText: string
  cancelText: string
}

export function SubscriptionActions({ 
  status,
  cancelling,
  onCancel,
  changePlanText,
  cancelPlanText,
  confirmCancelTitle,
  confirmCancelDesc,
  confirmButtonText,
  cancelText
}: SubscriptionActionsProps): JSX.Element {
  const router = useRouter()
  const isActive = status === 'active'

  return (
    <CardFooter className="flex gap-2">
      <Button 
        variant="default" 
        className="flex-1"
        onClick={() => router.push('/plans')}
      >
        {changePlanText}
      </Button>
      
      {isActive && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex-1" disabled={cancelling}>
              {cancelling ? <LoadingSpinner size="sm" /> : cancelPlanText}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmCancelTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmCancelDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{cancelText}</AlertDialogCancel>
              <AlertDialogAction onClick={onCancel}>
                {confirmButtonText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </CardFooter>
  )
}

