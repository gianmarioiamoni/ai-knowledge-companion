/**
 * AdminGuard Component
 * 
 * Protects routes that require admin or super_admin access
 */

'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/use-role'
import { useTranslations } from 'next-intl'
import { AlertCircle, Shield } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface AdminGuardProps {
  children: ReactNode
  requireSuperAdmin?: boolean
  fallback?: ReactNode
}

export function AdminGuard({
  children,
  requireSuperAdmin = false,
  fallback,
}: AdminGuardProps) {
  const { roleInfo, isAdmin, isSuperAdmin, loading } = useRole()
  const router = useRouter()
  const t = useTranslations('admin')

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">
            {t('loading', { default: 'Loading...' })}
          </p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!roleInfo) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {t('unauthorized.title', { default: 'Authentication Required' })}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              {t('unauthorized.description', {
                default: 'You must be logged in to access this page.',
              })}
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              {t('unauthorized.loginButton', { default: 'Go to Login' })}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // User is disabled
  if (roleInfo.status !== 'active') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {t('disabled.title', { default: 'Account Disabled' })}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p>
              {t('disabled.description', {
                default: 'Your account has been disabled. Please contact support.',
              })}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check role permissions
  const hasPermission = requireSuperAdmin ? isSuperAdmin : isAdmin

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>
            {t('forbidden.title', { default: 'Access Denied' })}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              {requireSuperAdmin
                ? t('forbidden.superAdminRequired', {
                    default: 'This page requires super admin privileges.',
                  })
                : t('forbidden.adminRequired', {
                    default: 'This page requires admin privileges.',
                  })}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              {t('forbidden.dashboardButton', { default: 'Go to Dashboard' })}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // User has permission - render children
  return <>{children}</>
}

/**
 * SuperAdminGuard Component
 * 
 * Shorthand for AdminGuard with requireSuperAdmin=true
 */
export function SuperAdminGuard({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <AdminGuard requireSuperAdmin={true} fallback={fallback}>
      {children}
    </AdminGuard>
  )
}

