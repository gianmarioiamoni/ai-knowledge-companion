import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-muted-foreground'
}: StatsCardProps): JSX.Element {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${iconColor}`} />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
