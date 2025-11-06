/**
 * Tutor Multimedia Section
 * Manage multimedia files associated with a tutor
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useTutorMultimedia } from '@/hooks/use-tutor-multimedia'
import { MultimediaPickerDialog } from '../ui/multimedia-picker-dialog'
import { formatFileSize, formatDuration } from '@/types/multimedia'
import type { JSX } from 'react'

interface TutorMultimediaSectionProps {
  tutorId: string
}

export function TutorMultimediaSection({ tutorId }: TutorMultimediaSectionProps): JSX.Element {
  const t = useTranslations('multimedia')
  const tTutors = useTranslations('tutors')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  
  const {
    items,
    isLoading,
    error,
    removeMultimedia,
    refreshMultimedia,
  } = useTutorMultimedia(tutorId)

  const handleRemove = async (documentId: string) => {
    if (!confirm(t('delete.message'))) return
    
    try {
      await removeMultimedia(documentId)
    } catch (error) {
      console.error('Remove error:', error)
      alert(t('errors.deleteFailed'))
    }
  }

  const handleAdd = () => {
    setIsPickerOpen(true)
  }

  const handlePickerClose = () => {
    setIsPickerOpen(false)
    refreshMultimedia()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            {tTutors('form.multimedia') || 'Multimedia'}
          </CardTitle>
          <CardDescription>
            {tTutors('form.multimediaDescription') || 'Add audio, video, and images to enhance your tutor'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            {t('common.loading') || 'Loading...'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                {tTutors('form.multimedia') || 'Multimedia'}
              </CardTitle>
              <CardDescription>
                {tTutors('form.multimediaDescription') || 'Add audio, video, and images to enhance your tutor'}
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.associate')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Music className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tTutors('form.noMultimedia') || 'No multimedia files associated yet'}
              </p>
              <Button
                onClick={handleAdd}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.associate')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.document.fileName}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>{formatFileSize(item.document.fileSize)}</span>
                      
                      {item.document.durationSeconds && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(item.document.durationSeconds)}</span>
                        </>
                      )}

                      <span>•</span>
                      <Badge
                        variant={
                          item.document.transcriptionStatus === 'completed' ? 'default' :
                          item.document.transcriptionStatus === 'processing' || item.document.transcriptionStatus === 'pending' ? 'secondary' :
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {t(`status.${item.document.transcriptionStatus}`)}
                      </Badge>
                    </div>

                    {item.document.transcriptionText && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                        {item.document.transcriptionText.substring(0, 150)}...
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.document.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Picker Dialog */}
      <MultimediaPickerDialog
        isOpen={isPickerOpen}
        onClose={handlePickerClose}
        tutorId={tutorId}
        excludeIds={items.map((item) => item.document.id)}
      />
    </>
  )
}

