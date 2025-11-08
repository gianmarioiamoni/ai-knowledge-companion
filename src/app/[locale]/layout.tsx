import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'AI Knowledge Companion',
  description: 'Your Personal Learning Assistant - Build your own AI tutor',
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
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }


  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Wrapper for blur effect - excludes mobile menu */}
          <div id="app-blur-target" className="min-h-screen flex flex-col">
            <Header locale={locale} />

            {/* Main content */}
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}