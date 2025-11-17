import { useTranslations } from 'next-intl'
import { UserCircle, User, LogOut, ChevronDown, Activity, BookOpen } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { JSX } from 'react'

interface UserMenuProps {
  userEmail?: string
  onSignOut: () => void
}

/**
 * User Menu Dropdown
 * - Compact display: Icon + Email + Chevron
 * - Dropdown with Profile and Logout options
 * - Responsive: hidden on mobile (mobile menu handles this)
 */
export function UserMenu({ userEmail, onSignOut }: UserMenuProps): JSX.Element {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  
  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const locale = pathname.split('/')[1] || 'en'
  
  // User Manual URL based on locale
  const userManualUrl = `https://github.com/gianmarioiamoni/ai-knowledge-companion/blob/main/docs/user/USER_MANUAL.${locale}.md`

  // Extract first part of email for display
  const displayName = userEmail?.split('@')[0] || 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="hidden md:flex items-center gap-1.5 md:gap-0 lg:gap-1.5 px-3 md:px-2 lg:px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-200 dark:border-blue-800"
        title={displayName}
      >
        <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="hidden lg:block text-sm font-bold text-blue-700 dark:text-blue-300 truncate max-w-[100px] lg:max-w-[150px]">
          {displayName}
        </span>
        <ChevronDown className="hidden lg:block h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/billing" className="flex items-center cursor-pointer">
            <Activity className="mr-2 h-4 w-4" />
            <span>{t('usage')}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a 
            href={userManualUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center cursor-pointer"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>{t('userManual')}</span>
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onSignOut}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

