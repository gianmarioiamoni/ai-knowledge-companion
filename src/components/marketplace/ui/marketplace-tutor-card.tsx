/**
 * Marketplace Tutor Card
 * Displays tutor info in grid
 */

'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Download } from 'lucide-react'
import { TutorDetailsDialog } from './tutor-details-dialog'
import type { MarketplaceTutor } from '@/types/marketplace'

interface MarketplaceTutorCardProps {
  tutor: MarketplaceTutor
}

export function MarketplaceTutorCard({ tutor }: MarketplaceTutorCardProps): JSX.Element {
  const t = useTranslations('marketplace')
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-1">{tutor.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                by {tutor.owner_display_name || 'Anonymous'}
              </CardDescription>
            </div>
            {tutor.featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {tutor.description || 'No description'}
          </p>

          {tutor.category && (
            <Badge variant="outline" className="mt-3">
              {tutor.category}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{tutor.rating_average.toFixed(1)}</span>
              <span className="text-xs">({tutor.reviews_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{tutor.forks_count}</span>
            </div>
          </div>
          <div className="font-semibold">
            {tutor.is_free ? t('free') : `$${tutor.price.toFixed(2)}`}
          </div>
        </CardFooter>
      </Card>

      <TutorDetailsDialog
        tutorId={tutor.id}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
}

