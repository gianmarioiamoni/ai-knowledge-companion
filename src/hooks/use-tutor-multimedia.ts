/**
 * Tutor Multimedia Hook
 * Manage multimedia associated with a tutor
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TutorMultimediaItem } from '@/types/multimedia'

export function useTutorMultimedia(tutorId: string) {
  const [items, setItems] = useState<TutorMultimediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMultimedia = useCallback(async () => {
    if (!tutorId) return
    
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/tutors/${tutorId}/multimedia`)
      if (!response.ok) {
        throw new Error('Failed to fetch multimedia')
      }

      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Fetch tutor multimedia error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load multimedia')
    } finally {
      setIsLoading(false)
    }
  }, [tutorId])

  const addMultimedia = useCallback(
    async (documentIds: string[]) => {
      const response = await fetch(`/api/tutors/${tutorId}/multimedia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add multimedia')
      }

      return await response.json()
    },
    [tutorId]
  )

  const removeMultimedia = useCallback(
    async (documentId: string) => {
      const response = await fetch(
        `/api/tutors/${tutorId}/multimedia/${documentId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove multimedia')
      }

      // Refresh list
      await fetchMultimedia()
    },
    [tutorId, fetchMultimedia]
  )

  const refreshMultimedia = useCallback(() => {
    fetchMultimedia()
  }, [fetchMultimedia])

  useEffect(() => {
    fetchMultimedia()
  }, [fetchMultimedia])

  return {
    items,
    isLoading,
    error,
    addMultimedia,
    removeMultimedia,
    refreshMultimedia,
  }
}

