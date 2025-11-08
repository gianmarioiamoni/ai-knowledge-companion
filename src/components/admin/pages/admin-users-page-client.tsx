/**
 * Admin Users Management Page Client Component (Refactored with SRP)
 * 
 * Main container for user management
 * SRP: Only responsible for coordinating child components - pure orchestration
 */

'use client'

import { JSX } from 'react'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useRole } from '@/hooks/use-role'
import { useAdminUserManagement } from '@/hooks/use-admin-user-management'
import {
  AdminUsersHeader,
  UserStatsCards,
  UserFilters,
  UsersTableCard,
  ConfirmationDialog,
} from '@/components/admin/users'

export function AdminUsersPageClient(): JSX.Element {
  const { isSuperAdmin } = useRole()
  
  // All business logic is now in the custom hook
  const { users, pagination, stats, loading, error, filters, actions } = useAdminUserManagement()

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <AdminUsersHeader />

        {/* Stats Cards */}
        <UserStatsCards stats={stats} />

        {/* Filters */}
        <UserFilters
          search={filters.search}
          roleFilter={filters.roleFilter}
          statusFilter={filters.statusFilter}
          onSearchChange={filters.handleSearchChange}
          onRoleChange={filters.handleRoleChange}
          onStatusChange={filters.handleStatusChange}
          onClear={filters.handleClearFilters}
        />

        {/* Users Table with Pagination */}
        <UsersTableCard
          users={users}
          pagination={pagination}
          loading={loading}
          error={error}
          isSuperAdmin={isSuperAdmin}
          onPageChange={filters.setPage}
          onResetPassword={actions.handleResetPassword}
          onDisableUser={actions.handleDisableUser}
          onEnableUser={actions.handleEnableUser}
          onDeleteUser={actions.handleDeleteUser}
          onPromoteUser={actions.handlePromoteUser}
          onDemoteUser={actions.handleDemoteUser}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={actions.confirmDialog.open}
          title={actions.confirmDialog.title}
          description={actions.confirmDialog.description}
          onConfirm={actions.confirmDialog.action}
          onCancel={() => actions.setConfirmDialog({ ...actions.confirmDialog, open: false })}
        />
      </div>
    </AdminGuard>
  )
}
