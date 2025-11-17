import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { getUserServer } from '@/lib/auth'
import { getUserRoleById } from '@/lib/auth/roles'
import { getTranslations } from 'next-intl/server'
import { AllUsersUsageDashboard } from '@/components/admin/usage/all-users-usage-dashboard'

// Force dynamic rendering - this page uses cookies() for auth
export const dynamic = 'force-dynamic'

interface AdminUsagePageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminUsagePage({ params }: AdminUsagePageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  // Check if user is super admin
  const roleInfo = await getUserRoleById(user.id)
  
  if (!roleInfo || !roleInfo.isSuperAdmin) {
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations({ locale, namespace: 'admin' })
  
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('usage.title')}</h1>
        <p className="text-muted-foreground">
          {t('usage.description')}
        </p>
      </div>

      {/* Dashboard */}
      <AllUsersUsageDashboard />
    </div>
  )
}

