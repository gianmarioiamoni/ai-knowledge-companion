import { Inter } from 'next/font/google'
import { Metadata } from 'next'
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
              <h1 className="text-xl font-semibold">AI Knowledge Companion</h1>
              <div>Locale: {locale}</div>
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