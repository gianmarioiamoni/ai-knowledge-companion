import { cn } from '@/lib/utils'
import { MenuHeader } from './menu-header'
import { UserInfo } from './user-info'
import { MenuNavigationWithSubmenu } from './menu-navigation-with-submenu'
import { MenuFooter } from './menu-footer'
import type { User } from '@supabase/supabase-js'
import type { JSX } from 'react'

interface MenuPanelProps {
  isOpen: boolean
  user: User | null
  pathname: string
  onClose: () => void
  onSignOut: () => void
}

export function MenuPanel({ isOpen, user, pathname, onClose, onSignOut }: MenuPanelProps): JSX.Element {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-gray-900 shadow-xl z-[110] transform transition-transform duration-300 ease-in-out md:hidden overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <MenuHeader onClose={onClose} />
        
        {user && <UserInfo user={user} onClose={onClose} />}
        
        <MenuNavigationWithSubmenu user={user} pathname={pathname} onNavigate={onClose} />
        
        <MenuFooter user={user} onSignOut={onSignOut} onClose={onClose} />
      </div>
    </div>
  )
}

