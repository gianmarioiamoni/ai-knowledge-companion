'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  ctaPrimary: string
  ctaSecondary: string
  locale: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  locale
}: HeroSectionProps): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {subtitle}
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link href={`/${locale}/auth/signup`}>
            <Button size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
              {ctaPrimary}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/login`}>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
              {ctaSecondary}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
