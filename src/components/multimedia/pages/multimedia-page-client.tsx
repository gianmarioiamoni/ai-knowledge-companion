/**
 * Multimedia Page Client Component
 * Tabbed interface for audio/video/image management
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Music, Video, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { AudioUploadSection } from '../sections/audio-upload-section'
import { ComingSoonSection } from '../ui/coming-soon-section'
import type { JSX } from 'react'

export function MultimediaPageClient(): JSX.Element {
  const t = useTranslations('multimedia')
  const [activeTab, setActiveTab] = useState('audio')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.audio')}</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2" disabled>
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.video')}</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2" disabled>
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.images')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Audio Tab */}
        <TabsContent value="audio" className="mt-6">
          <AudioUploadSection />
        </TabsContent>

        {/* Video Tab - Coming Soon */}
        <TabsContent value="video" className="mt-6">
          <ComingSoonSection
            icon={Video}
            title={t('video.title')}
            description={t('video.notAvailable')}
          />
        </TabsContent>

        {/* Images Tab - Coming Soon */}
        <TabsContent value="images" className="mt-6">
          <ComingSoonSection
            icon={ImageIcon}
            title={t('images.title')}
            description={t('images.notAvailable')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

