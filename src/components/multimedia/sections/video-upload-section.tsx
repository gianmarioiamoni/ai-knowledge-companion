/**
 * Video Upload Section
 * Main section for uploading and managing video files
 */

'use client'

import { JSX } from 'react'
import { VideoUploader } from '../ui/video-uploader'
import { VideoFilesSection } from './video-files-section'
import { useVideoFiles } from '@/hooks/use-video-files'

export function VideoUploadSection(): JSX.Element {
  const { files, loading, error, refetch, deleteFile, hasProcessingFiles } = useVideoFiles()

  return (
    <div className="space-y-6">
      {/* Video Uploader */}
      <VideoUploader onUploadComplete={refetch} />

      {/* Uploaded Videos List */}
      <VideoFilesSection 
        files={files}
        loading={loading}
        error={error}
        deleteFile={deleteFile}
        hasProcessingFiles={hasProcessingFiles}
      />
    </div>
  )
}

