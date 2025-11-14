import { Link } from '@/i18n/navigation'
import type { JSX } from 'react'

export function Logo(): JSX.Element {
  return (
    <Link href="/" className="flex-shrink-0" aria-label="AI Knowledge Companion - Home">
      <div className="flex flex-col items-center leading-tight hover:text-blue-600 transition-colors">
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">AI Knowledge</span>
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold -mt-0.5">Companion</span>
      </div>
    </Link>
  )
}

