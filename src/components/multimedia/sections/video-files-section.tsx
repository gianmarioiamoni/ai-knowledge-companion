/**
 * Video Files Section
 * Displays uploaded video files with preview and management options
 */

'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Video as VideoIcon, Trash2, ExternalLink, Loader2, AlertCircle, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import type { MultimediaDocument } from '@/types/multimedia'
import { formatDuration } from '@/types/multimedia'

interface VideoFilesSectionProps {
  files: MultimediaDocument[]
  loading: boolean
  error: string | null
  deleteFile: (id: string) => Promise<void>
  hasProcessingFiles: boolean
}

export function VideoFilesSection({ 
  files, 
  loading, 
  error, 
  deleteFile, 
  hasProcessingFiles 
}: VideoFilesSectionProps): JSX.Element {
  const t = useTranslations('multimedia.video')
  const tCommon = useTranslations('common')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<MultimediaDocument | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (file: MultimediaDocument) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return

    setDeleting(true)
    try {
      await deleteFile(fileToDelete.id)
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    } catch (error) {
      console.error('Failed to delete video:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'processing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVideoUrl = (file: MultimediaDocument): string => {
    return `/api/multimedia/${file.id}/preview`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5" />
            {t('yourVideos')}
          </CardTitle>
          <CardDescription>
            {files.length === 0 ? t('noVideos') : `${files.length} ${t('videosCount')}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <VideoIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('noVideosYet')}</p>
              <p className="text-sm mt-2">{t('uploadFirst')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <div
                  key={file.id}
                  className="group relative border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
                >
                  {/* Video Thumbnail/Icon */}
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <VideoIcon className="h-16 w-16 text-muted-foreground opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Status Badge Overlay */}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(file.transcriptionStatus)}
                    </div>

                    {/* Duration Badge */}
                    {file.durationSeconds && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(file.durationSeconds)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate" title={file.fileName}>
                      {file.fileName}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(getVideoUrl(file), '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        {tCommon('view')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(file)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Error Message */}
                    {file.transcriptionStatus === 'failed' && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          Processing failed
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Processing Notice */}
          {hasProcessingFiles && (
            <Alert className="mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {t('processingNotice')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription')}
              <br />
              <span className="font-medium">{fileToDelete?.fileName}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon('deleting')}
                </>
              ) : (
                tCommon('delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

