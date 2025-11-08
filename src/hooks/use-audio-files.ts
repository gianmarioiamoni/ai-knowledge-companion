/**
 * Audio Files Hook - Manage audio files state
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MultimediaDocument } from '@/types/multimedia'

export function useAudioFiles() {
  const [files, setFiles] = useState<MultimediaDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/multimedia?mediaType=audio')
      if (!response.ok) {
        throw new Error('Failed to fetch audio files')
      }
      
      const data = await response.json()
      const documents = data.documents || []
      setFiles(documents)

      // Auto-retry processing for stuck documents (same as documents hook)
      const stuckDocuments = documents.filter(
        (doc: MultimediaDocument) => doc.status === 'pending' || doc.status === 'processing'
      )

      if (stuckDocuments.length > 0) {
        console.log(`🔄 Found ${stuckDocuments.length} stuck multimedia documents, triggering processing...`)
        
        // Trigger worker in background for each stuck document
        // The worker processes jobs from the queue, so we just need to wake it up
        fetch('/api/multimedia/worker', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((err) => {
          console.warn('⚠️  Failed to trigger worker for stuck documents:', err)
          // Don't fail - cron will pick it up eventually
        })
      }
    } catch (err) {
      console.error('Fetch audio files error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadFile = useCallback(async (file: File) => {
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

    return await response.json()
  }, [])

  const deleteFile = useCallback(async (documentId: string) => {
    const response = await fetch(`/api/multimedia/${documentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Delete failed')
    }

    // Refresh list
    await fetchFiles()
  }, [fetchFiles])

  const refreshFiles = useCallback(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Auto-refresh for processing files (polling)
  useEffect(() => {
    const hasProcessingFiles = files.some(
      (file) => file.status === 'pending' || file.status === 'processing'
    )

    if (!hasProcessingFiles) {
      return
    }

    console.log('📡 Setting up polling for processing files...')
    
    // Poll every 5 seconds while there are processing files
    const intervalId = setInterval(() => {
      console.log('🔄 Polling for file status updates...')
      fetchFiles()
    }, 5000)

    return () => {
      console.log('🛑 Stopping polling')
      clearInterval(intervalId)
    }
  }, [files, fetchFiles])

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
    refreshFiles,
  }
}

