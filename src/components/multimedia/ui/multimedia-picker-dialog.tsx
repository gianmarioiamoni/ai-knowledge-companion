/**
 * Multimedia Picker Dialog
 * Select multimedia files to associate with a tutor
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Music, Image as ImageIcon, Video, Loader2 } from 'lucide-react'
import { formatFileSize, formatDuration } from '@/types/multimedia'
import type { MultimediaDocument } from '@/types/multimedia'
import type { JSX } from 'react'

interface MultimediaPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  tutorId: string
  excludeIds?: string[]
}

export function MultimediaPickerDialog({
  isOpen,
  onClose,
  tutorId,
  excludeIds = [],
}: MultimediaPickerDialogProps): JSX.Element {
  const t = useTranslations('multimedia')
  const [files, setFiles] = useState<MultimediaDocument[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/multimedia')
      if (!response.ok) throw new Error('Failed to fetch files')
      
      const data = await response.json()
      // Filter out already associated files
      const available = (data.documents || []).filter(
        (doc: MultimediaDocument) => !excludeIds.includes(doc.id)
      )
      setFiles(available)
    } catch (error) {
      console.error('Fetch files error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [excludeIds])

  useEffect(() => {
    if (isOpen) {
      fetchFiles()
      setSelectedIds([])
    }
  }, [isOpen, fetchFiles])

  const handleToggle = (documentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleSave = async () => {
    if (selectedIds.length === 0) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/tutors/${tutorId}/multimedia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to associate multimedia')
      }

      onClose()
    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('actions.associate')}</DialogTitle>
          <DialogDescription>
            Select multimedia files to add to your tutor
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-96 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Music className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('list.empty')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Upload multimedia files first from the Multimedia page
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const isSelected = selectedIds.includes(file.id)
                const isReady = file.transcriptionStatus === 'completed'
                
                // Choose icon based on media type
                const getMediaIcon = (mediaType: string) => {
                  switch (mediaType) {
                    case 'audio':
                      return <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    case 'image':
                      return <ImageIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    case 'video':
                      return <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    default:
                      return <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  }
                }
                
                const getBgColor = (mediaType: string) => {
                  switch (mediaType) {
                    case 'audio':
                      return 'bg-blue-100 dark:bg-blue-900/30'
                    case 'image':
                      return 'bg-green-100 dark:bg-green-900/30'
                    case 'video':
                      return 'bg-purple-100 dark:bg-purple-900/30'
                    default:
                      return 'bg-blue-100 dark:bg-blue-900/30'
                  }
                }

                return (
                  <div
                    key={file.id}
                    onClick={() => isReady && handleToggle(file.id)}
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                      isReady
                        ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700'
                        : 'opacity-50 cursor-not-allowed'
                    } ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={!isReady}
                      onChange={() => handleToggle(file.id)}
                      className="mt-1"
                    />

                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 ${getBgColor(file.mediaType)} rounded-lg flex items-center justify-center`}>
                        {getMediaIcon(file.mediaType)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {file.fileName}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>{formatFileSize(file.fileSize)}</span>
                        
                        {file.durationSeconds && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(file.durationSeconds)}</span>
                          </>
                        )}

                        <span>•</span>
                        <Badge
                          variant={
                            file.transcriptionStatus === 'completed' ? 'default' :
                            file.transcriptionStatus === 'processing' || file.transcriptionStatus === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {t(`status.${file.transcriptionStatus}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t('delete.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedIds.length === 0 || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

