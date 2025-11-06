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
      setFiles(data.documents || [])
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

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
    refreshFiles,
  }
}

