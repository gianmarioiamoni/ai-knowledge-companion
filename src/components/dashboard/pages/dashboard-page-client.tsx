'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useDashboard, type DashboardStats } from '@/hooks/use-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorPage } from '@/components/error'
import { PaymentStatus } from '@/components/stripe'
import { 
  StatsCard, 
  ActionCard, 
  WelcomeHeader, 
  RecentActivity 
} from '../ui'
import { FileText, Bot, MessageSquare, Upload } from 'lucide-react'

interface DashboardPageClientProps {
  locale: 'en' | 'it'
  initialStats?: DashboardStats
}

export function DashboardPageClient({ locale, initialStats }: DashboardPageClientProps): JSX.Element {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const { stats, isLoading, user, error } = useDashboard(initialStats)

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorPage
        message={error}
        title={t('error.title') || 'Error loading dashboard'}
        severity="error"
        showIcon
      />
    )
  }

  const handleGoToDocuments = () => {
    router.push('/documents')
  }

  const handleCreateTutor = () => {
    router.push('/tutors')
  }
  
  // Dynamic messages based on existing content
  const hasTutors = stats.totalTutors > 0
  const hasDocuments = stats.totalDocuments > 0
  const hasConversations = stats.totalConversations > 0
  
  // Check if user has any activity
  const hasActivity = hasDocuments || hasTutors || hasConversations
  
  // Build activities array for Recent Activity section
  const activities = []
  if (hasDocuments) {
    activities.push({
      icon: FileText,
      label: t('activityDocuments'),
      value: stats.totalDocuments,
      description: t('activityDocumentsDesc', { count: stats.totalDocuments })
    })
  }
  if (hasTutors) {
    activities.push({
      icon: Bot,
      label: t('activityTutors'),
      value: stats.totalTutors,
      description: t('activityTutorsDesc', { count: stats.totalTutors })
    })
  }
  if (hasConversations) {
    activities.push({
      icon: MessageSquare,
      label: t('activityConversations'),
      value: stats.totalConversations,
      description: t('activityConversationsDesc', { count: stats.totalConversations })
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        {/* Payment Status Alert */}
        <PaymentStatus />

        <WelcomeHeader
          title={t('title')}
          welcomeMessage={t('welcome')}
          userName={user?.email?.split('@')[0] || 'User'}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title={t('totalDocuments')}
            value={stats.totalDocuments}
            description={stats.totalDocuments === 0 ? t('noDocuments') : `${stats.totalDocuments} document${stats.totalDocuments === 1 ? '' : 's'} uploaded`}
            icon={FileText}
          />

          <StatsCard
            title={t('totalTutors')}
            value={stats.totalTutors}
            description={stats.totalTutors === 0 ? t('noTutors') : `${stats.totalTutors} tutor${stats.totalTutors === 1 ? '' : 's'} created`}
            icon={Bot}
          />

          <StatsCard
            title={t('totalConversations')}
            value={stats.totalConversations}
            description={stats.totalConversations === 0 ? t('noConversations') : `${stats.totalConversations} conversation${stats.totalConversations === 1 ? '' : 's'} started`}
            icon={MessageSquare}
          />

          <StatsCard
            title={t('apiCalls')}
            value={stats.apiCalls}
            description={stats.apiCalls === 0 ? t('noApiCalls') : `${stats.apiCalls} API call${stats.apiCalls === 1 ? '' : 's'} made`}
            icon={FileText}
            iconColor="text-green-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ActionCard
            title={hasDocuments ? t('uploadMoreDocuments') : t('uploadFirstDocument')}
            description={hasDocuments ? t('uploadMoreDocumentsDesc') : t('uploadFirstDocumentDesc')}
            icon={Upload}
            buttonText={t('goToDocuments')}
            buttonIcon={FileText}
            onAction={handleGoToDocuments}
          />

          <ActionCard
            title={hasTutors ? t('createAnotherTutor') : t('createFirstTutor')}
            description={hasTutors ? t('createAnotherTutorDesc') : t('createFirstTutorDesc')}
            icon={Bot}
            buttonText={hasTutors ? t('createTutor') : t('getStarted')}
            buttonIcon={Bot}
            onAction={handleCreateTutor}
            disabled={false}
          />
        </div>

        <RecentActivity
          title={t('recentActivityTitle')}
          description={hasActivity ? t('recentActivityDescActive') : t('recentActivityDescEmpty')}
          emptyMessage={t('recentActivityEmpty')}
          emptyIcon={FileText}
          hasActivity={hasActivity}
          activities={activities}
        />
      </div>
    </div>
  )
}
