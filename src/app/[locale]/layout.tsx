import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Link } from '@/lib/navigation'
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
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <Link href="/">
                    <h1 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                      AI Knowledge Companion
                    </h1>
                  </Link>
                  <nav className="flex items-center gap-6">
                    <Link 
                      href="/documents"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                    >
                      {locale === 'en' ? 'Documents' : 'Documenti'}
                    </Link>
                    <Link 
                      href="/dashboard"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                    >
                      {locale === 'en' ? 'Dashboard' : 'Dashboard'}
                    </Link>
                  </nav>
                </div>
                <LanguageSwitcher />
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}