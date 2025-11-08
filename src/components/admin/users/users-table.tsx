/**
 * Users Table Component
 * 
 * Displays users in a table with actions
 * SRP: Only responsible for rendering the users table
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MoreHorizontal,
  UserX,
  UserCheck,
  Key,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  display_name: string | null
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'disabled'
  current_cost: number
  tutor_count: number
}

interface UsersTableProps {
  users: UserData[]
  loading: boolean
  error: string | null
  isSuperAdmin: boolean
  onResetPassword: (userId: string, email: string) => void
  onDisableUser: (userId: string, email: string) => void
  onEnableUser: (userId: string, email: string) => void
  onDeleteUser: (userId: string, email: string) => void
  onPromoteUser: (userId: string, email: string) => void
  onDemoteUser: (userId: string, email: string) => void
}

export function UsersTable({
  users,
  loading,
  error,
  isSuperAdmin,
  onResetPassword,
  onDisableUser,
  onEnableUser,
  onDeleteUser,
  onPromoteUser,
  onDemoteUser,
}: UsersTableProps): JSX.Element {
  const t = useTranslations('admin.users')

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('table.empty', { default: 'No users found' })}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.email', { default: 'Email' })}</TableHead>
            <TableHead>{t('table.name', { default: 'Name' })}</TableHead>
            <TableHead>{t('table.role', { default: 'Role' })}</TableHead>
            <TableHead>{t('table.status', { default: 'Status' })}</TableHead>
            <TableHead className="text-right">
              {t('table.cost', { default: 'Cost' })}
            </TableHead>
            <TableHead className="text-right">
              {t('table.tutors', { default: 'Tutors' })}
            </TableHead>
            <TableHead className="text-right">
              {t('table.actions', { default: 'Actions' })}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.display_name || '-'}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === 'super_admin'
                      ? 'default'
                      : user.role === 'admin'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">${user.current_cost.toFixed(2)}</TableCell>
              <TableCell className="text-right">{user.tutor_count}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {t('actions.title', { default: 'Actions' })}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Reset Password */}
                    <DropdownMenuItem onClick={() => onResetPassword(user.id, user.email)}>
                      <Key className="mr-2 h-4 w-4" />
                      {t('actions.resetPassword.label', { default: 'Reset Password' })}
                    </DropdownMenuItem>

                    {/* Enable/Disable (Super Admin only) */}
                    {isSuperAdmin && user.role !== 'super_admin' && (
                      <>
                        {user.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => onDisableUser(user.id, user.email)}
                            className="text-orange-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            {t('actions.disable.label', { default: 'Disable' })}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onEnableUser(user.id, user.email)}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            {t('actions.enable.label', { default: 'Enable' })}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    {/* Promote/Demote (Super Admin only) */}
                    {isSuperAdmin && user.role !== 'super_admin' && (
                      <>
                        <DropdownMenuSeparator />
                        {user.role === 'user' ? (
                          <DropdownMenuItem onClick={() => onPromoteUser(user.id, user.email)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('actions.promote.label', { default: 'Promote to Admin' })}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onDemoteUser(user.id, user.email)}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            {t('actions.demote.label', { default: 'Demote to User' })}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    {/* Delete (Super Admin only) */}
                    {isSuperAdmin && user.role !== 'super_admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteUser(user.id, user.email)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('actions.delete.label', { default: 'Delete' })}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

