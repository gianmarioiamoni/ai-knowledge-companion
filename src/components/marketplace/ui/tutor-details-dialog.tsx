/**
 * Tutor Details Dialog
 * Modal with full tutor preview and fork button
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Eye, GitFork, AlertCircle } from 'lucide-react'
import { useTutorDetails } from '@/hooks/use-marketplace'
import { useForkTutor } from '@/hooks/use-marketplace-actions'
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/hooks/use-auth'


interface TutorDetailsDialogProps {
  tutorId: string
  open: boolean
  onClose: () => void
}

export function TutorDetailsDialog({ tutorId, open, onClose }: TutorDetailsDialogProps): JSX.Element {
  const t = useTranslations('marketplace')
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading } = useTutorDetails(open ? tutorId : null)
  const { forkTutor, isForking, error: forkError, clearError } = useForkTutor()

  const handleFork = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page
      router.push('/auth/login')
      return
    }

    clearError()
    const result = await forkTutor(tutorId)
    if (result?.success && result.forked_tutor) {
      // Redirect to the forked tutor
      router.push(`/tutors`)
      onClose()
    }
  }

  if (isLoading || !data) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tutorDetails')}</DialogTitle>
            <DialogDescription>{t('loadingTutorDetails')}</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const { tutor, statistics, reviews } = data

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tutor.name}</DialogTitle>
          <DialogDescription>
            {tutor.description || t('noDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Show fork error if any */}
        {forkError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">{t('forkError')}</h4>
                <p className="text-sm text-red-700 mt-1">{forkError}</p>
                {!user && (
                  <p className="text-sm text-red-700 mt-2">
                    {t('loginRequired')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t('createdBy')} {tutor.owner_display_name || 'Anonymous'}
            </p>
            
            {tutor.category && (
              <Badge variant="outline" className="mt-3">
                {tutor.category}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Star className="h-5 w-5 mx-auto mb-1 fill-yellow-400 text-yellow-400" />
              <div className="font-semibold">{tutor.rating_average.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">{tutor.reviews_count} reviews</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <GitFork className="h-5 w-5 mx-auto mb-1" />
              <div className="font-semibold">{statistics.total_forks}</div>
              <div className="text-xs text-muted-foreground">Forks</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Eye className="h-5 w-5 mx-auto mb-1" />
              <div className="font-semibold">{statistics.total_views}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="font-semibold text-lg">
                {tutor.is_free ? t('free') : `$${tutor.price.toFixed(2)}`}
              </div>
              <div className="text-xs text-muted-foreground">Price</div>
            </div>
          </div>

          {/* Reviews Preview */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recent Reviews</h3>
              <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {review.user_display_name || 'Anonymous'}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="text-sm">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleFork}
              disabled={isForking}
              className="flex-1"
            >
              <GitFork className="h-4 w-4 mr-2" />
              {isForking 
                ? t('forking') 
                : !user 
                ? t('loginToFork') 
                : t('fork')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

