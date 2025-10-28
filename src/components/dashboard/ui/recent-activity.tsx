import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface RecentActivityProps {
  title: string
  description: string
  emptyMessage: string
  emptyIcon: LucideIcon
}

export function RecentActivity({
  title,
  description,
  emptyMessage,
  emptyIcon: EmptyIcon
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
          <div className="text-center py-8 text-gray-500">
            <EmptyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
