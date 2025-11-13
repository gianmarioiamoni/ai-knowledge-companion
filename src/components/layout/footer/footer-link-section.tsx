/**
 * Footer Link Section Component
 * Reusable component for displaying a section of links
 */

import { JSX } from 'react'
import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
  isExternal?: boolean
}

interface FooterLinkSectionProps {
  title: string
  links: FooterLink[]
}

export function FooterLinkSection({ title, links }: FooterLinkSectionProps): JSX.Element {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((link, index) => (
          <li key={index}>
            {link.isExternal ? (
              <a 
                href={link.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link 
                href={link.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

