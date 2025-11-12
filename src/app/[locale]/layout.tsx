import { Inter } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Toaster } from '@/components/ui/sonner'
import { CookieConsentBanner } from '@/components/cookies/cookie-consent-banner'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Viewport configuration (separated from metadata in Next.js 15)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
}

export const metadata: Metadata = {
  // Base URL for resolving relative URLs (required for Open Graph images)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  
  title: {
    default: 'AI Knowledge Companion',
    template: '%s | AI Knowledge Companion'
  },
  description: 'Your Personal Learning Assistant - Build your own AI tutor with RAG capabilities, document processing, and intelligent chat',
  keywords: ['AI', 'Learning', 'Tutor', 'RAG', 'Knowledge Management', 'Education', 'OpenAI', 'LangChain'],
  authors: [{ name: 'AI Knowledge Companion Team' }],
  creator: 'AI Knowledge Companion',
  publisher: 'AI Knowledge Companion',
  
  // Icons and Favicon
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/icons/icon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-180x180.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-knowledge-companion.vercel.app',
    title: 'AI Knowledge Companion',
    description: 'Your Personal Learning Assistant - Build your own AI tutor with RAG capabilities',
    siteName: 'AI Knowledge Companion',
    images: [
      {
        url: '/icons/icon-512x512.svg',
        width: 512,
        height: 512,
        alt: 'AI Knowledge Companion Logo',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary',
    title: 'AI Knowledge Companion',
    description: 'Your Personal Learning Assistant - Build your own AI tutor',
    images: ['/icons/icon-512x512.svg'],
  },
  
  // Additional Meta Tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as 'en' | 'it')) {
    notFound()
  }


  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Skip to main content link for keyboard users */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          {/* Wrapper for blur effect - excludes mobile menu */}
          <div id="app-blur-target" className="min-h-screen flex flex-col">
            <Header locale={locale} />
            
            {/* Breadcrumb navigation */}
            <Breadcrumb locale={locale} />

            {/* Main content */}
            <main id="main-content" className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
          <Toaster />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}