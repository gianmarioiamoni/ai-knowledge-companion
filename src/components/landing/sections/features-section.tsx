'use client'

import { JSX } from 'react'
import { Upload, Settings, MessageCircle, Share2 } from 'lucide-react'
import { FeatureCard } from '../ui/feature-card'

interface FeaturesSectionProps {
  features: {
    upload: { title: string; description: string }
    customize: { title: string; description: string }
    learn: { title: string; description: string }
    share: { title: string; description: string }
  }
}

export function FeaturesSection({ features }: FeaturesSectionProps): JSX.Element {
  const featureData = [
    {
      icon: Upload,
      iconColor: 'text-blue-600',
      title: features.upload.title,
      description: features.upload.description,
    },
    {
      icon: Settings,
      iconColor: 'text-green-600',
      title: features.customize.title,
      description: features.customize.description,
    },
    {
      icon: MessageCircle,
      iconColor: 'text-purple-600',
      title: features.learn.title,
      description: features.learn.description,
    },
    {
      icon: Share2,
      iconColor: 'text-orange-600',
      title: features.share.title,
      description: features.share.description,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featureData.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            iconColor={feature.iconColor}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  )
}
