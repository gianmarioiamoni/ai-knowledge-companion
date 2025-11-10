/**
 * Image Uploader Component
 * Handles drag-and-drop and click-to-upload for image files
 */

'use client'

import { JSX, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ImageFile {
  file: File
  preview: string
  progress: number
  error?: string
}

interface ImageUploaderProps {
  onUploadComplete?: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps): JSX.Element {
  const t = useTranslations('multimedia.image')
  const tCommon = useTranslations('common')

  const [images, setImages] = useState<ImageFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setGlobalError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        if (errors[0]?.code === 'file-too-large') {
          return `${file.name}: File too large (max 10MB)`
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
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }))

    setImages(prev => [...prev, ...newImages])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview) // Clean up preview URL
      newImages.splice(index, 1)
      return newImages
    })
  }

  const uploadImage = async (imageFile: ImageFile, index: number) => {
    try {
      const formData = new FormData()
      formData.append('file', imageFile.file)
      formData.append('mediaType', 'image')

      const response = await fetch('/api/multimedia/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      // Update progress to 100%
      setImages(prev => {
        const updated = [...prev]
        updated[index].progress = 100
        return updated
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setImages(prev => {
        const updated = [...prev]
        updated[index].error = errorMessage
        return updated
      })
      return false
    }
  }

  const handleUploadAll = async () => {
    if (images.length === 0) return

    setUploading(true)
    setGlobalError(null)

    try {
      // Upload all images in parallel
      const uploadPromises = images.map((img, index) => uploadImage(img, index))
      const results = await Promise.all(uploadPromises)

      // Check if all uploads succeeded
      const allSucceeded = results.every(r => r)

      if (allSucceeded) {
        // Clear images first
        setImages([])
        
        // Wait a bit before refreshing to ensure DB updates are complete
        setTimeout(() => {
          onUploadComplete?.()
        }, 1500)
      } else {
        setGlobalError('Some uploads failed. Please retry.')
      }
    } catch (error) {
      setGlobalError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
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
            {t('supportedFormats')}: JPG, PNG, GIF, WebP (max 10MB)
          </p>
        </div>

        {/* Global Error */}
        {globalError && (
          <Alert variant="destructive">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {/* Image Preview List */}
        {images.length > 0 && (
          <div className="space-y-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* Preview Thumbnail */}
                <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{img.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(img.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {uploading && !img.error && (
                    <Progress value={img.progress} className="mt-2 h-1" />
                  )}

                  {/* Error Message */}
                  {img.error && (
                    <p className="text-xs text-destructive mt-1">{img.error}</p>
                  )}
                </div>

                {/* Remove Button */}
                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* Uploading Spinner */}
                {uploading && !img.error && (
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
                    {t('uploadAll')} ({images.length})
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

