/**
 * useUserFilters Hook
 * 
 * Manages filter state and pagination for user list
 * SRP: Only responsible for filter and pagination state management
 */

'use client'

import { useState, useCallback } from 'react'

interface UseUserFiltersResult {
  search: string
  roleFilter: string
  statusFilter: string
  page: number
  setSearch: (value: string) => void
  setRoleFilter: (value: string) => void
  setStatusFilter: (value: string) => void
  setPage: (value: number) => void
  handleSearchChange: (value: string) => void
  handleRoleChange: (value: string) => void
  handleStatusChange: (value: string) => void
  handleClearFilters: () => void
}

export function useUserFilters(): UseUserFiltersResult {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(1)
  }, [])

  return {
    search,
    roleFilter,
    statusFilter,
    page,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handleClearFilters,
  }
}

