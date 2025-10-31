import { Link } from '@/i18n/navigation'
import type { JSX } from 'react'

export function Logo(): JSX.Element {
  return (
    <Link href="/" className="min-w-0">
      <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:text-blue-600 transition-colors truncate">
        <span className="hidden sm:inline">AI Knowledge Companion</span>
        <span className="sm:hidden">AI KC</span>
      </h1>
    </Link>
  )
}

