/**
 * Audio Uploader Component - Simple drag & drop file uploader
 */

'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Music, Upload, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_AUDIO_TYPES, MULTIMEDIA_FILE_LIMITS } from '@/types/multimedia'
import type { JSX } from 'react'

interface AudioUploaderProps {
  onUploadSuccess: () => void
}

export function AudioUploader({ onUploadSuccess }: AudioUploaderProps): JSX.Element {
  const t = useTranslations('multimedia.upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    try {
      setIsUploading(true)
      setUploadStatus('idle')
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/multimedia/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      setUploadStatus('success')
      setStatusMessage(t('success'))
      setTimeout(() => {
        setUploadStatus('idle')
        onUploadSuccess()
      }, 2000)
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setStatusMessage(error instanceof Error ? error.message : t('error'))
      setTimeout(() => setUploadStatus('idle'), 3000)
    } finally {
      setIsUploading(false)
    }
  }, [t, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac'],
    },
    maxSize: MULTIMEDIA_FILE_LIMITS.audio,
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          ) : (
            <Music className="h-12 w-12 text-gray-400" />
          )}

          <div>
            {isUploading ? (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('uploading')}
              </p>
            ) : isDragActive ? (
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t('dragActive')}
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('dropzone')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('supportedFormats')}: {t('audioFormats')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('maxSize')}: 100MB
                </p>
              </>
            )}
          </div>

          {!isUploading && !isDragActive && (
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {t('selectFiles')}
            </Button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-400">{statusMessage}</span>
        </div>
      )}
      
      {uploadStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <X className="h-5 w-5 text-red-600 dark:text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">{statusMessage}</span>
        </div>
      )}
    </div>
  )
}

