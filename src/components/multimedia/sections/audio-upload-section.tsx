/**
 * Audio Upload Section - Main audio file management interface
 * Sprint 5: Upload, transcription, and management of audio files
 */

'use client'

import { useTranslations } from 'next-intl'
import { AudioUploader } from '../ui/audio-uploader'
import { AudioFileList } from '../ui/audio-file-list'
import { useAudioFiles } from '@/hooks/use-audio-files'
import { AlertCircle } from 'lucide-react'
import type { JSX } from 'react'

export function AudioUploadSection(): JSX.Element {
  const t = useTranslations('multimedia.audio')
  const { files, isLoading, error, uploadFile, refreshFiles, deleteFile } = useAudioFiles()

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('description')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('maxSize')}
            </p>
          </div>

          <AudioUploader onUploadSuccess={refreshFiles} />
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Files List */}
      <AudioFileList
        files={files}
        isLoading={isLoading}
        onDelete={deleteFile}
        onRefresh={refreshFiles}
      />
    </div>
  )
}

