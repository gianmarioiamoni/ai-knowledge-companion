'use client'

import { JSX } from 'react'
import { useParams } from 'next/navigation'
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
  const params = useParams()
  const pathname = usePathname()
  
  // Get locale directly from URL params - this is always accurate
  const currentLocale = (params?.locale as string) || 'en'
  const currentLanguage = languages.find(lang => lang.code === currentLocale)

  // Debug: console.log('LanguageSwitcher:', { currentLocale, pathname })

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
            className={language.code === currentLocale ? 'bg-accent' : ''}
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
