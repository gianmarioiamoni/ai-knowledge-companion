import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Settings, MessageCircle, Share2 } from 'lucide-react'
import { Link } from '@/lib/navigation'

export default function LandingPage(): JSX.Element {
  const t = useTranslations('landing')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('subtitle')}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {t('description')}
          </p>
          
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                {t('cta.primary')}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                {t('cta.secondary')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Upload className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>{t('features.upload.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.upload.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>{t('features.customize.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.customize.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>{t('features.learn.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.learn.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Share2 className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>{t('features.share.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.share.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
