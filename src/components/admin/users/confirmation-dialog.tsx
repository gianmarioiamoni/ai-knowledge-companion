/**
 * ConfirmationDialog Component
 * 
 * Reusable confirmation dialog for user actions
 * SRP: Only responsible for rendering the confirmation dialog
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function ConfirmationDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps): JSX.Element {
  const t = useTranslations('admin.users')

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t('dialog.cancel', { default: 'Cancel' })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await onConfirm()
              onCancel()
            }}
          >
            {t('dialog.confirm', { default: 'Confirm' })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

