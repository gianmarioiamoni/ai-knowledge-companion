import { JSX } from 'react'
import { Link } from '@/i18n/navigation'

interface AuthLinkProps {
  href: string
  children: string
  className?: string
}

export function AuthLink({ 
  href, 
  children, 
  className = "underline" 
}: AuthLinkProps): JSX.Element {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
