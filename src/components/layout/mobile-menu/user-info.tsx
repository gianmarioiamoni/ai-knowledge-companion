import { useTranslations } from 'next-intl'
import type { JSX } from 'react'

interface UserInfoProps {
  user: {
    email?: string
  }
}

export function UserInfo({ user }: UserInfoProps): JSX.Element {
  const t = useTranslations('navigation')

  return (
    <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('profile')}
          </p>
        </div>
      </div>
    </div>
  )
}

