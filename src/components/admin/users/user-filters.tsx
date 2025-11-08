/**
 * User Filters Component
 * 
 * Provides search and filter controls for user list
 * SRP: Only responsible for rendering and handling filter UI
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface UserFiltersProps {
  search: string
  roleFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClear: () => void
}

export function UserFilters({
  search,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}: UserFiltersProps): JSX.Element {
  const t = useTranslations('admin.users.filters')

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('title', { default: 'Filters' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search', { default: 'Search users...' })}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter || 'all'} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('role', { default: 'All roles' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('allRoles', { default: 'All roles' })}
              </SelectItem>
              <SelectItem value="user">
                {t('users', { default: 'Users' })}
              </SelectItem>
              <SelectItem value="admin">
                {t('admins', { default: 'Admins' })}
              </SelectItem>
              <SelectItem value="super_admin">
                {t('superAdmins', { default: 'Super Admins' })}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter || 'all'} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('status', { default: 'All statuses' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('allStatuses', { default: 'All statuses' })}
              </SelectItem>
              <SelectItem value="active">
                {t('activeOnly', { default: 'Active' })}
              </SelectItem>
              <SelectItem value="disabled">
                {t('disabledOnly', { default: 'Disabled' })}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Button */}
          <Button variant="outline" onClick={onClear}>
            {t('clear', { default: 'Clear Filters' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

