'use client'

import { JSX } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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

interface SimpleLanguageSwitcherProps {
    currentLocale: string
}

export function SimpleLanguageSwitcher({ currentLocale }: SimpleLanguageSwitcherProps): JSX.Element {
    const router = useRouter()
    const pathname = usePathname()

    const handleLanguageChange = (newLocale: string) => {
        // Replace the current locale in the pathname with the new one
        const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
        const newPath = `/${newLocale}${pathWithoutLocale}`
        router.push(newPath)
    }

    const currentLanguage = languages.find(lang => lang.code === currentLocale)

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
                        onClick={() => handleLanguageChange(language.code)}
                        className={language.code === currentLocale ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{language.flag}</span>
                        {language.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
