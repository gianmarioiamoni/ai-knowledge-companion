import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { SimpleLanguageSwitcher } from '@/components/simple-language-switcher'
import Link from 'next/link'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

const locales = ['en', 'it']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
  if (!locales.includes(locale as any)) {
    return <div>Invalid locale</div>
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Link href={`/${locale}`}>
                  <h1 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                    AI Knowledge Companion
                  </h1>
                </Link>
                <nav className="flex items-center gap-6">
                  <Link 
                    href={`/${locale}/documents`}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    {locale === 'en' ? 'Documents' : 'Documenti'}
                  </Link>
                  <Link 
                    href={`/${locale}/dashboard`}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    {locale === 'en' ? 'Dashboard' : 'Dashboard'}
                  </Link>
                </nav>
              </div>
              <SimpleLanguageSwitcher currentLocale={locale} />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}