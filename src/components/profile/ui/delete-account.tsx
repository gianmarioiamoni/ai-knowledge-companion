'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { JSX } from 'react'

interface DeleteAccountProps {
  onDeleteAccount: (password: string) => Promise<void>
  deleting?: boolean
}

export function DeleteAccount({ onDeleteAccount, deleting = false }: DeleteAccountProps): JSX.Element {
  const t = useTranslations('profile')
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setError(null)

    // Validation
    if (!password) {
      setError(t('delete.passwordRequired'))
      return
    }

    if (confirmation !== 'DELETE') {
      setError(t('delete.confirmationRequired'))
      return
    }

    await onDeleteAccount(password)
    
    setOpen(false)
    setPassword('')
    setConfirmation('')
  }

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg text-red-600 dark:text-red-400 truncate">
              {t('delete.title')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">
              {t('delete.description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {t('delete.button')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6">
            <DialogHeader className="space-y-2 sm:space-y-3">
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="truncate">{t('delete.confirmTitle')}</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t('delete.confirmDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="delete_password" className="text-xs sm:text-sm">
                  {t('delete.password')}
                </Label>
                <Input
                  id="delete_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('delete.passwordPlaceholder')}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Confirmation */}
              <div className="space-y-2">
                <Label htmlFor="delete_confirmation" className="text-xs sm:text-sm">
                  {t('delete.confirmation')}
                </Label>
                <Input
                  id="delete_confirmation"
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  className="text-xs sm:text-sm font-mono"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t('delete.confirmationHint')}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto text-xs sm:text-sm order-2 sm:order-1"
              >
                {t('delete.cancel')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={!password || confirmation !== 'DELETE' || deleting}
                className="w-full sm:w-auto text-xs sm:text-sm order-1 sm:order-2"
              >
                {deleting ? t('delete.deleting') : t('delete.confirmButton')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

