/**
 * Image Upload Section
 * Main section for uploading and managing image files
 */

'use client'

import { JSX } from 'react'
import { ImageUploader } from '../ui/image-uploader'
import { ImageFilesSection } from './image-files-section'
import { useImageFiles } from '@/hooks/use-image-files'

export function ImageUploadSection(): JSX.Element {
  const { files, loading, error, refetch, deleteFile, hasProcessingFiles } = useImageFiles()

  return (
    <div className="space-y-6">
      {/* Image Uploader */}
      <ImageUploader onUploadComplete={refetch} />

      {/* Uploaded Images List */}
      <ImageFilesSection 
        files={files}
        loading={loading}
        error={error}
        deleteFile={deleteFile}
        hasProcessingFiles={hasProcessingFiles}
      />
    </div>
  )
}

