/**
 * Top Users List Component
 * 
 * Displays top users by cost in a compact list format
 * SRP: Only responsible for rendering top users list
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TopUser {
  userId: string
  email: string
  displayName: string | null
  cost: number
  apiCalls: number
}

interface TopUsersListProps {
  users: TopUser[]
}

export function TopUsersList({ users }: TopUsersListProps): JSX.Element {
  const t = useTranslations('admin.dashboard.topUsers')

  if (users.length === 0) {
    return <></>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title', { default: 'Top Users by Cost' })}</CardTitle>
        <CardDescription>
          {t('description', { default: 'Users with highest costs this period' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.slice(0, 5).map((user, index) => (
            <div
              key={user.userId}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{user.displayName || user.email}</p>
                  {user.displayName && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${user.cost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {user.apiCalls.toLocaleString()}{' '}
                  {t('calls', { default: 'calls' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

