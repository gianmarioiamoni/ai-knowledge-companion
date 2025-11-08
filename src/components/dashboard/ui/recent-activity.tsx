import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, FileText, Bot, MessageSquare } from 'lucide-react'

interface ActivityItem {
  icon: LucideIcon
  label: string
  value: number
  description: string
}

interface RecentActivityProps {
  title: string
  description: string
  emptyMessage: string
  emptyIcon: LucideIcon
  hasActivity?: boolean
  activities?: ActivityItem[]
}

export function RecentActivity({
  title,
  description,
  emptyMessage,
  emptyIcon: EmptyIcon,
  hasActivity = false,
  activities = []
}: RecentActivityProps): JSX.Element {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasActivity ? (
            <div className="text-center py-8 text-gray-500">
              <EmptyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {activity.value}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
