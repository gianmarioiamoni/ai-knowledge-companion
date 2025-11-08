/**
 * useUserActions Hook
 * 
 * Handles all user management actions with confirmation dialogs
 * SRP: Only responsible for user action logic and state management
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'

interface ConfirmDialog {
  open: boolean
  title: string
  description: string
  action: () => Promise<void>
}

interface UserActionHandlers {
  resetPassword: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>
  disableUser: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>
  enableUser: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>
  deleteUser: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>
  promoteUser: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>
  demoteUser: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>
}

interface UseUserActionsResult {
  confirmDialog: ConfirmDialog
  setConfirmDialog: (dialog: ConfirmDialog) => void
  handleResetPassword: (userId: string, email: string) => void
  handleDisableUser: (userId: string, email: string) => void
  handleEnableUser: (userId: string, email: string) => void
  handleDeleteUser: (userId: string, email: string) => void
  handlePromoteUser: (userId: string, email: string) => void
  handleDemoteUser: (userId: string, email: string) => void
}

export function useUserActions(handlers: UserActionHandlers): UseUserActionsResult {
  const t = useTranslations('admin.users.actions')
  const { toast } = useToast()

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  })

  const createHandler = (
    actionKey: string,
    userId: string,
    email: string,
    actionFn: () => Promise<{ success: boolean; error?: string }>
  ) => {
    setConfirmDialog({
      open: true,
      title: t(`${actionKey}.title`),
      description: t(`${actionKey}.confirm`, { email }),
      action: async () => {
        const result = await actionFn()
        if (result.success) {
          toast({
            title: t(`${actionKey}.success`),
          })
        } else {
          toast({
            title: t(`${actionKey}.error`, { default: 'Error' }),
            description: result.error,
            variant: 'destructive',
          })
        }
      },
    })
  }

  const handleResetPassword = (userId: string, email: string) => {
    createHandler('resetPassword', userId, email, () => handlers.resetPassword(userId, email))
  }

  const handleDisableUser = (userId: string, email: string) => {
    createHandler('disable', userId, email, () => handlers.disableUser(userId, email))
  }

  const handleEnableUser = (userId: string, email: string) => {
    createHandler('enable', userId, email, () => handlers.enableUser(userId, email))
  }

  const handleDeleteUser = (userId: string, email: string) => {
    createHandler('delete', userId, email, () => handlers.deleteUser(userId, email))
  }

  const handlePromoteUser = (userId: string, email: string) => {
    createHandler('promote', userId, email, () => handlers.promoteUser(userId, email))
  }

  const handleDemoteUser = (userId: string, email: string) => {
    createHandler('demote', userId, email, () => handlers.demoteUser(userId, email))
  }

  return {
    confirmDialog,
    setConfirmDialog,
    handleResetPassword,
    handleDisableUser,
    handleEnableUser,
    handleDeleteUser,
    handlePromoteUser,
    handleDemoteUser,
  }
}

