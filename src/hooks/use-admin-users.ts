/**
 * useAdminUsers Hook
 * 
 * Fetches and manages admin user list
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserStats {
  id: string
  email: string
  registered_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  display_name: string | null
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'disabled'
  promoted_at: string | null
  disabled_at: string | null
  tutor_count: number
  document_count: number
  conversation_count: number
  current_cost: number
  current_api_calls: number
  current_tokens: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  total: number
  active: number
  disabled: number
  users: number
  admins: number
  superAdmins: number
}

interface UseAdminUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  autoFetch?: boolean
}

interface UseAdminUsersReturn {
  users: UserStats[]
  pagination: Pagination
  stats: Stats
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  resetPassword: (userId: string) => Promise<{ success: boolean; error?: string }>
  disableUser: (userId: string, reason?: string) => Promise<{ success: boolean; error?: string }>
  enableUser: (userId: string) => Promise<{ success: boolean; error?: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>
  promoteUser: (userId: string) => Promise<{ success: boolean; error?: string }>
  demoteUser: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export function useAdminUsers(params: UseAdminUsersParams = {}): UseAdminUsersReturn {
  const {
    page = 1,
    limit = 50,
    search = '',
    role = '',
    status = '',
    sortBy = 'registered_at',
    sortOrder = 'desc',
    autoFetch = true,
  } = params

  const [users, setUsers] = useState<UserStats[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page,
    limit,
    total: 0,
    totalPages: 0,
  })
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    disabled: 0,
    users: 0,
    admins: 0,
    superAdmins: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      })

      if (search) queryParams.append('search', search)
      if (role) queryParams.append('role', role)
      if (status) queryParams.append('status', status)

      const response = await fetch(`/api/admin/users?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()

      setUsers(data.users)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, role, status, sortBy, sortOrder])

  useEffect(() => {
    if (autoFetch) {
      fetchUsers()
    }
  }, [autoFetch, fetchUsers])

  const resetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const disableUser = async (userId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Refresh users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const enableUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable' }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Refresh users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Refresh users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const promoteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote' }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Refresh users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const demoteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demote' }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Refresh users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return {
    users,
    pagination,
    stats,
    loading,
    error,
    fetchUsers,
    resetPassword,
    disableUser,
    enableUser,
    deleteUser,
    promoteUser,
    demoteUser,
  }
}

