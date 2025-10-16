'use client'

import { useState, useEffect } from 'react'
import type { Document } from '@/types/database'
import * as documentsService from '@/lib/supabase/documents'
import { useAuth } from './use-auth'

export function useDocuments() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user documents
  const loadDocuments = async () => {
    if (!user) {
      setDocuments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await documentsService.getUserDocuments(user.id)
      
      if (fetchError) {
        setError(fetchError)
      } else {
        setDocuments(data || [])
      }
    } catch (err) {
      setError('Failed to load documents')
      console.error('Load documents error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Upload and create document
  const uploadDocument = async (file: File, title: string, description?: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)

      // Upload file
      const { path, error: uploadError } = await documentsService.uploadFile(file, user.id)
      if (uploadError) {
        throw new Error(uploadError)
      }

      // Create document record
      const documentData = {
        owner_id: user.id,
        title,
        description,
        storage_path: path,
        mime_type: file.type,
        visibility: 'private' as const
      }

      const { data, error: createError } = await documentsService.createDocument(documentData)
      if (createError) {
        throw new Error(createError)
      }

      // Add to local state
      if (data) {
        setDocuments(prev => [data, ...prev])
      }

      return { success: true, document: data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Delete document
  const deleteDocument = async (documentId: string) => {
    try {
      setError(null)
      
      const { error: deleteError } = await documentsService.deleteDocument(documentId)
      if (deleteError) {
        throw new Error(deleteError)
      }

      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Get file download URL
  const getFileUrl = async (storagePath: string) => {
    try {
      const { url, error: urlError } = await documentsService.getFileUrl(storagePath)
      if (urlError) {
        throw new Error(urlError)
      }
      return url
    } catch (err) {
      console.error('Get file URL error:', err)
      return null
    }
  }

  // Load documents when user changes
  useEffect(() => {
    loadDocuments()
  }, [user])

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    getFileUrl,
    refreshDocuments: loadDocuments
  }
}
