/**
 * Audio File List - Display uploaded audio files
 */

'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music, Trash2, Clock, DollarSign } from 'lucide-react'
import { formatFileSize, formatDuration } from '@/types/multimedia'
import type { MultimediaDocument } from '@/types/multimedia'
import type { JSX } from 'react'

interface AudioFileListProps {
  files: MultimediaDocument[]
  isLoading: boolean
  onDelete: (id: string) => Promise<void>
  onRefresh: () => void
}

export function AudioFileList({ files, isLoading, onDelete }: AudioFileListProps): JSX.Element {
  const t = useTranslations('multimedia')

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {t('list.loading') || 'Loading...'}
        </div>
      </Card>
    )
  }

  if (files.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <Music className="h-16 w-16 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('list.empty')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('list.emptyDescription')}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('list.title') || 'Your Audio Files'} ({files.length})
      </h3>
      
      <div className="grid gap-4">
        {files.map((file) => (
          <Card key={file.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Music className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {file.fileName}
                </h4>
                
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatFileSize(file.fileSize)}</span>
                  
                  {file.durationSeconds && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(file.durationSeconds)}
                      </span>
                    </>
                  )}

                  {file.transcriptionCost && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${file.transcriptionCost.toFixed(4)}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-2">
                  <Badge variant={
                    file.transcriptionStatus === 'completed' ? 'default' :
                    file.transcriptionStatus === 'processing' || file.transcriptionStatus === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {t(`status.${file.transcriptionStatus}`)}
                  </Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (confirm(t('delete.message'))) {
                    await onDelete(file.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

