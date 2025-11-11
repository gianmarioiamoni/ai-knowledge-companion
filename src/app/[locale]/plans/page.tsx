/**
 * Plans Page - Main entry point with SEO optimization
 * SSR-optimized page structure
 */

import { JSX } from 'react'
import type { Metadata } from 'next'
import { PlansPageClient } from '@/components/plans/pages/plans-page-client'
import { StructuredDataWrapper } from '@/components/seo'
import { generateMetadata, generateOfferSchema } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  return generateMetadata({
    title: locale === 'en' ? 'Pricing Plans' : 'Piani Tariffari',
    description: locale === 'en'
      ? 'Choose the perfect AI Knowledge Companion plan for your learning needs. Free trial available. Flexible monthly and yearly subscriptions.'
      : 'Scegli il piano AI Knowledge Companion perfetto per le tue esigenze di apprendimento. Prova gratuita disponibile. Abbonamenti mensili e annuali flessibili.',
    keywords: [
      'pricing',
      'plans',
      'subscription',
      'free trial',
      'monthly',
      'yearly',
      'AI tutor pricing',
    ],
    locale,
    path: '/plans',
  })
}

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params

  // Generate structured data for pricing plans
  const structuredData = [
    generateOfferSchema('Free Plan', '0', 'USD', locale),
    generateOfferSchema('Starter Plan', '9.99', 'USD', locale),
    generateOfferSchema('Pro Plan', '19.99', 'USD', locale),
    generateOfferSchema('Enterprise Plan', '49.99', 'USD', locale),
  ]

  return (
    <>
      <StructuredDataWrapper data={structuredData} />
      <PlansPageClient />
    </>
  )
}

