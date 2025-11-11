import { Link } from '@/i18n/navigation'
import type { JSX } from 'react'

export function Logo(): JSX.Element {
  return (
    <Link href="/" className="min-w-0" aria-label="AI Knowledge Companion - Home">
      <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:text-blue-600 transition-colors truncate">
        <span className="hidden sm:inline">AI Knowledge Companion</span>
        <span className="sm:hidden">AI KC</span>
      </div>
    </Link>
  )
}

