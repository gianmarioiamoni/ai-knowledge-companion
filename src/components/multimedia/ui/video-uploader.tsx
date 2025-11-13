/**
 * Video Uploader Component
 * Handles drag-and-drop and click-to-upload for video files
 */

'use client'

import { JSX, useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import { Upload, Video as VideoIcon, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VideoFile {
  file: File
  progress: number
  error?: string
}

interface VideoUploaderProps {
  onUploadComplete?: () => void
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],
}

export function VideoUploader({ onUploadComplete }: VideoUploaderProps): JSX.Element {
  const t = useTranslations('multimedia.video')


  const [videos, setVideos] = useState<VideoFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setGlobalError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        if (errors[0]?.code === 'file-too-large') {
          return `${file.name}: File too large (max 500MB)`
        }
        if (errors[0]?.code === 'file-invalid-type') {
          return `${file.name}: Invalid file type`
        }
        return `${file.name}: ${errors[0]?.message}`
      })
      setGlobalError(errors.join(', '))
      return
    }

    // Add accepted files to the list
    const newVideos = acceptedFiles.map(file => ({
      file,
      progress: 0,
    }))

    setVideos(prev => [...prev, ...newVideos])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_VIDEO_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const removeVideo = (index: number) => {
    setVideos(prev => {
      const newVideos = [...prev]
      newVideos.splice(index, 1)
      return newVideos
    })
  }

  const uploadVideo = async (videoFile: VideoFile, index: number) => {
    try {
      const formData = new FormData()
      formData.append('file', videoFile.file)
      formData.append('mediaType', 'video')

      const response = await fetch('/api/multimedia/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      // Update progress to 100%
      setVideos(prev => {
        const updated = [...prev]
        updated[index].progress = 100
        return updated
      })

      return true
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setVideos(prev => {
        const updated = [...prev]
        updated[index].error = errorMessage
        return updated
      })
      return false
    }
  }

  const handleUploadAll = async () => {
    if (videos.length === 0) return

    setUploading(true)
    setGlobalError(null)

    try {
      // Upload all videos in parallel
      const uploadPromises = videos.map((vid, index) => uploadVideo(vid, index))
      const results = await Promise.all(uploadPromises)

      // Check if all uploads succeeded
      const allSucceeded = results.every(r => r)

      if (allSucceeded) {
        // Clear videos first
        setVideos([])
        
        // Wait a bit before refreshing to ensure DB updates are complete
        setTimeout(() => {
          onUploadComplete?.()
        }, 1500)
      } else {
        setGlobalError('Some uploads failed. Please retry.')
      }
    } catch (_error) {
      setGlobalError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg font-medium">{t('dropHere')}</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">{t('dragDrop')}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('or')}</p>
              <Button type="button" variant="outline">
                {t('browse')}
              </Button>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            {t('supportedFormats')}: MP4, MOV, AVI, WebM (max 500MB)
          </p>
        </div>

        {/* Global Error */}
        {globalError && (
          <Alert variant="destructive">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {/* Video Preview List */}
        {videos.length > 0 && (
          <div className="space-y-3">
            {videos.map((vid, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* Video Icon */}
                <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
                  <VideoIcon className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{vid.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(vid.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {uploading && !vid.error && (
                    <Progress value={vid.progress} className="mt-2 h-1" />
                  )}

                  {/* Error Message */}
                  {vid.error && (
                    <p className="text-xs text-destructive mt-1">{vid.error}</p>
                  )}
                </div>

                {/* Remove Button */}
                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* Uploading Spinner */}
                {uploading && !vid.error && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            ))}

            {/* Upload All Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleUploadAll}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('uploadAll')} ({videos.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

