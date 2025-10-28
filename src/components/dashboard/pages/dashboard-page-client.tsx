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
  const { stats, isLoading, user } = useDashboard()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
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
          userName={user.email?.split('@')[0] || 'User'}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={t('totalDocuments')}
            value={stats.totalDocuments}
            description={t('noDocuments')}
            icon={FileText}
          />

          <StatsCard
            title={t('totalTutors')}
            value={stats.totalTutors}
            description={t('noTutors')}
            icon={Bot}
          />

          <StatsCard
            title={t('totalConversations')}
            value={stats.totalConversations}
            description="Coming soon"
            icon={MessageSquare}
          />

          <StatsCard
            title={t('apiCalls')}
            value={stats.apiCalls}
            description="This month"
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
