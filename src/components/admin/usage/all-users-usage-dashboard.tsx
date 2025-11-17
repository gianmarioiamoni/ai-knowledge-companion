/**
 * All Users Usage Dashboard Component
 * Displays usage statistics for all users (Super Admin only)
 * 
 * SRP Applied:
 * - Logic: useAdminUsageData hook (src/hooks/use-admin-usage-data.ts)
 * - UI: Separate components for each section
 */

'use client'

import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminUsageData } from '@/hooks/use-admin-usage-data'
import { AdminUsageTotals } from './ui/admin-usage-totals'
import { AdminUsageSortButtons } from './ui/admin-usage-sort-buttons'
import { AdminUserUsageItem } from './ui/admin-user-usage-item'
import { AdminUsageLoading } from './ui/admin-usage-loading'
import { AdminUsageError } from './ui/admin-usage-error'
import { AdminUsageEmpty } from './ui/admin-usage-empty'

export function AllUsersUsageDashboard(): JSX.Element {
  const { data, sortedUsers, isLoading, error, sortBy, sortOrder, handleSort } = useAdminUsageData()

  if (isLoading) {
    return <AdminUsageLoading />
  }

  if (error) {
    return <AdminUsageError error={error} />
  }

  if (!data) {
    return <AdminUsageEmpty />
  }

  return (
    <div className="space-y-6">
      {/* Totals Summary */}
      <AdminUsageTotals totals={data.totals} />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users Usage Details</CardTitle>
              <CardDescription>Usage statistics for all users</CardDescription>
            </div>
            <AdminUsageSortButtons
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedUsers.map((user) => (
              <AdminUserUsageItem key={user.user_id} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

