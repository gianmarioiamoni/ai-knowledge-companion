'use client'

import { JSX } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
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
  const router = useRouter()

  const currentLanguage = languages.find(lang => lang.code === locale)

  const handleLanguageChange = (newLocale: string) => {
    // Use router.push with locale option for language switching
    router.push(pathname, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-4">
          <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">
            {currentLanguage?.flag}
            <span className="hidden sm:inline ml-1">{currentLanguage?.name}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={language.code === locale ? 'bg-accent' : ''}
          >
            <span className="mr-2 text-base">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
