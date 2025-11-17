import { JSX, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface SupportOptionCardProps {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}

/**
 * Support Option Card Component
 * Displays a single support option with icon, title, description, and action button
 */
export function SupportOptionCard({ 
  icon: Icon, 
  title, 
  description, 
  children 
}: SupportOptionCardProps): JSX.Element {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      </div>
      {children}
    </div>
  )
}

