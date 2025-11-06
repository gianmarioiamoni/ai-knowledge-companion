/**
 * Coming Soon Section - Placeholder for unimplemented features
 */

import { Card } from '@/components/ui/card'
import { AlertCircle, type LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

interface ComingSoonSectionProps {
  icon: LucideIcon
  title: string
  description: string
}

export function ComingSoonSection({ icon: Icon, title, description }: ComingSoonSectionProps): JSX.Element {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative">
          <Icon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          <div className="absolute -top-2 -right-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {description}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
            Coming Soon
          </span>
        </div>
      </div>
    </Card>
  )
}

