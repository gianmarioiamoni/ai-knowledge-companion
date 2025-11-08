/**
 * useAdminUserManagement Hook
 * 
 * Combines user data fetching, filters, and actions
 * SRP: Only responsible for orchestrating user management logic
 */

'use client'

import { useAdminUsers } from './use-admin-users'
import { useUserActions } from './use-user-actions'
import { useUserFilters } from './use-user-filters'

export function useAdminUserManagement() {
  // Filter and pagination management
  const filters = useUserFilters()

  // Fetch users with current filters
  const {
    users,
    pagination,
    stats,
    loading,
    error,
    resetPassword: resetPasswordApi,
    disableUser: disableUserApi,
    enableUser: enableUserApi,
    deleteUser: deleteUserApi,
    promoteUser: promoteUserApi,
    demoteUser: demoteUserApi,
  } = useAdminUsers({
    page: filters.page,
    limit: 50,
    search: filters.search,
    role: filters.roleFilter === 'all' ? '' : filters.roleFilter,
    status: filters.statusFilter === 'all' ? '' : filters.statusFilter,
  })

  // Adapter functions to match useUserActions signature
  const resetPassword = async (userId: string, _email: string) => {
    return await resetPasswordApi(userId)
  }

  const disableUser = async (userId: string, _email: string) => {
    return await disableUserApi(userId)
  }

  const enableUser = async (userId: string, _email: string) => {
    return await enableUserApi(userId)
  }

  const deleteUser = async (userId: string, _email: string) => {
    return await deleteUserApi(userId)
  }

  const promoteUser = async (userId: string, _email: string) => {
    return await promoteUserApi(userId)
  }

  const demoteUser = async (userId: string, _email: string) => {
    return await demoteUserApi(userId)
  }

  // User actions with confirmation dialogs
  const actions = useUserActions({
    resetPassword,
    disableUser,
    enableUser,
    deleteUser,
    promoteUser,
    demoteUser,
  })

  return {
    // User data
    users,
    pagination,
    stats,
    loading,
    error,
    // Filters
    filters,
    // Actions
    actions,
  }
}

