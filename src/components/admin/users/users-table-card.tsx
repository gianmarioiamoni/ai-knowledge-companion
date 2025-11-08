/**
 * UsersTableCard Component
 * 
 * Card component containing the users table and pagination
 * SRP: Only responsible for rendering the table card and pagination controls
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UsersTable } from './users-table'

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

interface UsersTableCardProps {
  users: UserStats[]
  pagination: Pagination
  loading: boolean
  error: string | null
  isSuperAdmin: boolean
  onPageChange: (page: number) => void
  onResetPassword: (userId: string, email: string) => void
  onDisableUser: (userId: string, email: string) => void
  onEnableUser: (userId: string, email: string) => void
  onDeleteUser: (userId: string, email: string) => void
  onPromoteUser: (userId: string, email: string) => void
  onDemoteUser: (userId: string, email: string) => void
}

export function UsersTableCard({
  users,
  pagination,
  loading,
  error,
  isSuperAdmin,
  onPageChange,
  onResetPassword,
  onDisableUser,
  onEnableUser,
  onDeleteUser,
  onPromoteUser,
  onDemoteUser,
}: UsersTableCardProps): JSX.Element {
  const t = useTranslations('admin.users')

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('table.title', { default: 'Users' })} ({pagination.total})
        </CardTitle>
        <CardDescription>
          {t('table.description', {
            default: 'Page {page} of {totalPages}',
            page: pagination.page,
            totalPages: pagination.totalPages,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersTable
          users={users}
          loading={loading}
          error={error}
          isSuperAdmin={isSuperAdmin}
          onResetPassword={onResetPassword}
          onDisableUser={onDisableUser}
          onEnableUser={onEnableUser}
          onDeleteUser={onDeleteUser}
          onPromoteUser={onPromoteUser}
          onDemoteUser={onDemoteUser}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              {t('pagination.previous', { default: 'Previous' })}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('pagination.info', {
                default: 'Page {page} of {totalPages}',
                page: pagination.page,
                totalPages: pagination.totalPages,
              })}
            </span>
            <Button
              variant="outline"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              {t('pagination.next', { default: 'Next' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

