/**
 * useMarketplaceActions Hook
 * Handles marketplace actions: fork, review, view tracking
 */

'use client'

import { useState, useCallback } from 'react'
import type { ReviewFormData, ForkResult } from '@/types/marketplace'
import type { Tutor, TutorReview } from '@/types/database'

// Hook for forking tutors
export function useForkTutor() {
  const [isForking, setIsForking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const forkTutor = useCallback(async (
    tutorId: string,
    newName?: string
  ): Promise<ForkResult | null> => {
    setIsForking(true)
    setError(null)

    try {
      const response = await fetch(`/api/marketplace/${tutorId}/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fork tutor')
      }

      const data: ForkResult & { tutor: Tutor } = await response.json()

      return {
        success: true,
        forked_tutor: data.tutor,
        fork_record: data.fork_record
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fork tutor'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsForking(false)
    }
  }, [])

  return {
    forkTutor,
    isForking,
    error,
    clearError: () => setError(null)
  }
}

// Hook for creating/updating reviews
export function useReview() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReview = useCallback(async (
    tutorId: string,
    reviewData: ReviewFormData
  ): Promise<{ success: boolean; review?: TutorReview; error?: string }> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/marketplace/${tutorId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }

      const data = await response.json()

      return {
        success: true,
        review: data.review
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const deleteReview = useCallback(async (
    tutorId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/marketplace/${tutorId}/review`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete review')
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    submitReview,
    deleteReview,
    isSubmitting,
    isDeleting,
    error,
    clearError: () => setError(null)
  }
}

// Hook for tracking views (fire and forget)
export function useTrackView() {
  const trackView = useCallback(async (tutorId: string) => {
    try {
      // Fire and forget - don't wait for response
      fetch(`/api/marketplace/${tutorId}/view`, {
        method: 'POST'
      }).catch(() => {
        // Silently fail - view tracking is not critical
      })
    } catch {
      // Silently fail
    }
  }, [])

  return { trackView }
}

