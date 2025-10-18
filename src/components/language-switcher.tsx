'use client'

import { JSX } from 'react'
import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
]

export function LanguageSwitcher(): JSX.Element {
  const locale = useLocale()
  const pathname = usePathname()

  const currentLanguage = languages.find(lang => lang.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          {currentLanguage?.flag} {currentLanguage?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            asChild
            className={language.code === locale ? 'bg-accent' : ''}
          >
            <Link href={pathname} locale={language.code as 'en' | 'it'}>
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
