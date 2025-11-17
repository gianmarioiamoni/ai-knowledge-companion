import { JSX, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

interface FaqCategoryCardProps {
  title: string
  children: ReactNode
}

/**
 * FAQ Category Card Component
 * Groups related FAQ questions under a category
 */
export function FaqCategoryCard({ title, children }: FaqCategoryCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

