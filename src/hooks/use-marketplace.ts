/**
 * useMarketplace Hook
 * Manages marketplace state and operations
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type {
  MarketplaceTutor,
  MarketplaceQuery,
  MarketplaceTutorsResponse,
  TutorDetailsResponse
} from '@/types/marketplace'

interface MarketplaceState {
  tutors: MarketplaceTutor[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export function useMarketplace(initialQuery?: MarketplaceQuery) {
  const [state, setState] = useState<MarketplaceState>({
    tutors: [],
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
    isLoading: false,
    error: null
  })

  const [query, setQuery] = useState<MarketplaceQuery>(initialQuery || {})

  // Load marketplace tutors
  const loadTutors = useCallback(async (resetPage = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const currentQuery = resetPage 
        ? { ...query, offset: 0 }
        : query

      const params = new URLSearchParams()

      // Add filters
      if (currentQuery.filters?.category) {
        params.append('category', currentQuery.filters.category)
      }
      if (currentQuery.filters?.is_free !== undefined) {
        params.append('is_free', String(currentQuery.filters.is_free))
      }
      if (currentQuery.filters?.min_rating) {
        params.append('min_rating', String(currentQuery.filters.min_rating))
      }
      if (currentQuery.filters?.max_price) {
        params.append('max_price', String(currentQuery.filters.max_price))
      }
      if (currentQuery.filters?.tags?.length) {
        params.append('tags', currentQuery.filters.tags.join(','))
      }
      if (currentQuery.filters?.search) {
        params.append('search', currentQuery.filters.search)
      }

      // Add sorting and pagination
      if (currentQuery.sort_by) {
        params.append('sort_by', currentQuery.sort_by)
      }
      if (currentQuery.limit) {
        params.append('limit', String(currentQuery.limit))
      }
      if (currentQuery.offset !== undefined) {
        params.append('offset', String(currentQuery.offset))
      }

      const response = await fetch(`/api/marketplace?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load marketplace tutors')
      }

      const data: MarketplaceTutorsResponse = await response.json()

      setState({
        tutors: data.tutors,
        total: data.total,
        page: data.page,
        limit: data.limit,
        hasMore: data.hasMore,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }, [query])

  // Update filters
  const updateFilters = useCallback((filters: Partial<MarketplaceQuery['filters']>) => {
    setQuery(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      },
      offset: 0 // Reset to first page
    }))
  }, [])

  // Update sorting
  const updateSort = useCallback((sort_by: MarketplaceQuery['sort_by']) => {
    setQuery(prev => ({
      ...prev,
      sort_by,
      offset: 0 // Reset to first page
    }))
  }, [])

  // Load next page
  const loadMore = useCallback(() => {
    if (!state.hasMore || state.isLoading) return

    setQuery(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20)
    }))
  }, [state.hasMore, state.isLoading])

  // Reset filters
  const resetFilters = useCallback(() => {
    setQuery({
      filters: {},
      sort_by: 'newest',
      limit: 20,
      offset: 0
    })
  }, [])

  // Load tutors when query changes
  useEffect(() => {
    loadTutors()
  }, [query, loadTutors])

  return {
    // State
    tutors: state.tutors,
    total: state.total,
    page: state.page,
    limit: state.limit,
    hasMore: state.hasMore,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    loadTutors,
    updateFilters,
    updateSort,
    loadMore,
    resetFilters,
    
    // Current query
    query
  }
}

// Hook for tutor details
export function useTutorDetails(tutorId: string | null) {
  const [state, setState] = useState<{
    data: TutorDetailsResponse | null
    isLoading: boolean
    error: string | null
  }>({
    data: null,
    isLoading: false,
    error: null
  })

  const loadDetails = useCallback(async () => {
    if (!tutorId) return

    setState({ data: null, isLoading: true, error: null })

    try {
      const response = await fetch(`/api/marketplace/${tutorId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load tutor details')
      }

      const data: TutorDetailsResponse = await response.json()

      setState({
        data,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      })
    }
  }, [tutorId])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  return {
    ...state,
    reload: loadDetails
  }
}

// Hook for categories
export function useMarketplaceCategories() {
  const [state, setState] = useState<{
    categories: Array<{ category: string; count: number }>
    isLoading: boolean
    error: string | null
  }>({
    categories: [],
    isLoading: false,
    error: null
  })

  useEffect(() => {
    const loadCategories = async () => {
      setState({ categories: [], isLoading: true, error: null })

      try {
        const response = await fetch('/api/marketplace/categories')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to load categories')
        }

        const data = await response.json()

        setState({
          categories: data.categories,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setState({
          categories: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        })
      }
    }

    loadCategories()
  }, [])

  return state
}

