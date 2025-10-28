import { useState, useCallback } from 'react'
import { queryRAG, queryTutorRAG, type RAGQuery, type RAGResponse, type RAGError } from '@/lib/openai/rag'
import { useAuth } from './use-auth'

export interface UseRAGOptions {
  tutorId?: string
  maxChunks?: number
  similarityThreshold?: number
  context?: string
}

export function useRAG(options: UseRAGOptions = {}) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<RAGResponse | null>(null)

  const query = useCallback(async (
    question: string,
    customOptions: Partial<UseRAGOptions> = {}
  ): Promise<{ data?: RAGResponse; error?: RAGError }> => {
    if (!user) {
      return {
        error: {
          error: 'User not authenticated',
          code: 'AUTH_REQUIRED'
        }
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const mergedOptions = { ...options, ...customOptions }
      
      const ragQuery: RAGQuery = {
        question,
        context: mergedOptions.context,
        tutorId: mergedOptions.tutorId,
        userId: user.id,
        maxChunks: mergedOptions.maxChunks,
        similarityThreshold: mergedOptions.similarityThreshold
      }

      const result = mergedOptions.tutorId
        ? await queryTutorRAG(question, mergedOptions.tutorId, user.id, ragQuery)
        : await queryRAG(ragQuery)

      if (result.error) {
        setError(result.error.error)
        return result
      }

      if (result.data) {
        setLastResponse(result.data)
      }

      return result
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during RAG query'
      setError(errorMessage)
      return {
        error: {
          error: errorMessage,
          code: 'UNKNOWN_ERROR'
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, options])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearResponse = useCallback(() => {
    setLastResponse(null)
  }, [])

  return {
    // State
    isLoading,
    error,
    lastResponse,
    
    // Actions
    query,
    clearError,
    clearResponse,
    
    // User info
    isAuthenticated: !!user
  }
}
