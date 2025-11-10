/**
 * Hook for managing image files
 * Provides functions to fetch, filter, and manage image files
 */

import { useState, useEffect, useCallback } from 'react'
import type { MultimediaDocument } from '@/types/multimedia'

interface UseImageFilesResult {
  files: MultimediaDocument[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  deleteFile: (id: string) => Promise<void>
  hasProcessingFiles: boolean
}

export function useImageFiles(): UseImageFilesResult {
  const [files, setFiles] = useState<MultimediaDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessingFiles, setHasProcessingFiles] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/multimedia?mediaType=image')
      
      if (!response.ok) {
        throw new Error('Failed to fetch image files')
      }

      const data = await response.json()
      setFiles(data.files || [])

      // Check if any files are being processed
      const processing = data.files?.some(
        (file: MultimediaDocument) => 
          file.status === 'pending' || file.status === 'processing'
      ) || false
      setHasProcessingFiles(processing)

      // If there are stuck documents (pending or processing for >5 minutes),
      // trigger the worker to process them
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const stuckDocuments = data.files?.filter((file: MultimediaDocument) => {
        if (file.status !== 'pending' && file.status !== 'processing') {
          return false
        }
        const createdAt = new Date(file.created_at)
        return createdAt < fiveMinutesAgo
      })

      if (stuckDocuments && stuckDocuments.length > 0) {
        // Trigger worker in background (fire-and-forget)
        fetch('/api/multimedia/worker', { method: 'POST' }).catch(() => {
          // Ignore errors from background worker trigger
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteFile = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/multimedia/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete image file')
      }

      // Remove from local state
      setFiles(prev => prev.filter(file => file.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(errorMessage)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Poll for updates if there are processing files
  useEffect(() => {
    if (!hasProcessingFiles) return

    const interval = setInterval(() => {
      fetchFiles()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [hasProcessingFiles, fetchFiles])

  return {
    files,
    loading,
    error,
    refetch: fetchFiles,
    deleteFile,
    hasProcessingFiles,
  }
}

