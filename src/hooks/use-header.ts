import { useAuth } from '@/hooks/use-auth'
import { useRouter, usePathname } from '@/i18n/navigation'

export function useHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const isActivePath = (path: string) => pathname === path

  return {
    user,
    pathname,
    handleSignOut,
    isActivePath
  }
}

