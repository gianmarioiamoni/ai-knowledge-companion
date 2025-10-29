'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useDashboard } from '@/hooks/use-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  StatsCard, 
  ActionCard, 
  WelcomeHeader, 
  RecentActivity 
} from '../ui'
import { FileText, Bot, MessageSquare, Upload } from 'lucide-react'

interface DashboardPageClientProps {
  locale: 'en' | 'it'
}

export function DashboardPageClient({ locale }: DashboardPageClientProps): JSX.Element {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const { stats, isLoading, user, error } = useDashboard()

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error loading dashboard</h2>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  const handleGoToDocuments = () => {
    router.push('/documents')
  }

  const handleCreateTutor = () => {
    // Coming soon functionality
    console.log('Create tutor - coming soon')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <WelcomeHeader
          title={t('title')}
          welcomeMessage={t('welcome')}
          userName={user?.email?.split('@')[0] || 'User'}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title={t('uploadFirstDocument')}
            description="Start building your knowledge base by uploading your first document."
            icon={Upload}
            buttonText="Go to Documents"
            buttonIcon={FileText}
            onAction={handleGoToDocuments}
          />

          <ActionCard
            title={t('createFirstTutor')}
            description="Create your first AI tutor to start learning from your documents."
            icon={Bot}
            buttonText="Coming Soon"
            buttonIcon={Bot}
            onAction={handleCreateTutor}
            disabled={true}
          />
        </div>

        <RecentActivity
          title="Recent Activity"
          description="Your latest documents and conversations will appear here."
          emptyMessage="No activity yet. Start by uploading a document!"
          emptyIcon={FileText}
        />
      </div>
    </div>
  )
}
