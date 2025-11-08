/**
 * Top Users Table Component
 * 
 * Displays top users by cost
 * SRP: Only responsible for rendering top users table
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface TopUser {
  userId: string
  email: string
  displayName: string | null
  cost: number
  tokens: number
  apiCalls: number
}

interface TopUsersTableProps {
  users: TopUser[]
}

export function TopUsersTable({ users }: TopUsersTableProps): JSX.Element {
  const t = useTranslations('admin.billing.topUsers')

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title', { default: 'Top Users by Cost' })}</CardTitle>
          <CardDescription>
            {t('description', {
              default: 'Users with highest costs in selected period',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('empty', { default: 'No usage data' })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title', { default: 'Top Users by Cost' })}</CardTitle>
        <CardDescription>
          {t('description', {
            default: 'Users with highest costs in selected period',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t('email', { default: 'Email' })}</TableHead>
                <TableHead>{t('name', { default: 'Name' })}</TableHead>
                <TableHead className="text-right">
                  {t('cost', { default: 'Cost' })}
                </TableHead>
                <TableHead className="text-right">
                  {t('tokens', { default: 'Tokens' })}
                </TableHead>
                <TableHead className="text-right">
                  {t('calls', { default: 'API Calls' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">
                    <Badge variant={index < 3 ? 'default' : 'outline'}>
                      {index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.displayName || '-'}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${user.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.tokens.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.apiCalls.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

