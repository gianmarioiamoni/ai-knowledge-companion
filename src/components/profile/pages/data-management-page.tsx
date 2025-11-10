'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { toast } from 'sonner'

export function DataManagementPage(): JSX.Element {
  const t = useTranslations('profile.dataManagement')
  const tCommon = useTranslations('common')

  const [exportLoading, setExportLoading] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleExportData = async () => {
    setExportLoading(true)
    setExportSuccess(false)

    try {
      const response = await fetch('/api/user/export-data', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportSuccess(true)
      toast.success(t('exportSuccess'))
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('exportError'))
    } finally {
      setExportLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Redirect to home after successful deletion
      window.location.href = '/'
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(t('deleteError'))
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* GDPR Info */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t('gdprNotice')}
        </AlertDescription>
      </Alert>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('export.title')}
          </CardTitle>
          <CardDescription>
            {t('export.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('export.includes')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>{t('export.profile')}</li>
              <li>{t('export.tutors')}</li>
              <li>{t('export.documents')}</li>
              <li>{t('export.conversations')}</li>
              <li>{t('export.multimedia')}</li>
              <li>{t('export.subscription')}</li>
            </ul>
          </div>

          {exportSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t('export.downloaded')}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleExportData}
            disabled={exportLoading}
            className="w-full sm:w-auto"
          >
            {exportLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('export.exporting')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('export.button')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('delete.title')}
          </CardTitle>
          <CardDescription>
            {t('delete.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('delete.warning')}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">{t('delete.willBeDeleted')}</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>{t('delete.profile')}</li>
              <li>{t('delete.tutors')}</li>
              <li>{t('delete.documents')}</li>
              <li>{t('delete.conversations')}</li>
              <li>{t('delete.multimedia')}</li>
              <li>{t('delete.subscription')}</li>
            </ul>
          </div>

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('delete.button')}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('delete.confirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>{t('delete.confirmDescription')}</p>
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  <strong>{t('delete.confirmWarning')}</strong>
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete.confirmButton')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

