/**
 * AdminUsersHeader Component
 * 
 * Header for the user management page
 * SRP: Only responsible for rendering the page header
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Shield } from 'lucide-react'

export function AdminUsersHeader(): JSX.Element {
  const t = useTranslations('admin.users')

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        {t('title', { default: 'User Management' })}
      </h1>
      <p className="text-muted-foreground">
        {t('subtitle', { default: 'Manage all registered users' })}
      </p>
    </div>
  )
}

