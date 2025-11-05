import type { Tutor, TutorReview, TutorFork } from './database'

// Marketplace Tutor with additional fields
export interface MarketplaceTutor extends Tutor {
  owner_display_name?: string
  total_views?: number
  unique_viewers?: number
}

// Marketplace filters
export interface MarketplaceFilters {
  category?: string | null
  is_free?: boolean | null
  min_rating?: number
  max_price?: number
  tags?: string[]
  search?: string
}

// Marketplace sort options
export type MarketplaceSortBy = 'rating' | 'downloads' | 'newest' | 'popular' | 'price_low' | 'price_high'

// Marketplace query params
export interface MarketplaceQuery {
  filters?: MarketplaceFilters
  sort_by?: MarketplaceSortBy
  limit?: number
  offset?: number
}

// Review with user info
export interface ReviewWithUser extends TutorReview {
  user_display_name?: string
  user_avatar_url?: string
}

// Fork result
export interface ForkResult {
  success: boolean
  forked_tutor?: Tutor
  fork_record?: TutorFork
  error?: string
}

// Tutor statistics
export interface TutorStatistics {
  total_views: number
  unique_viewers: number
  total_forks: number
  total_reviews: number
  rating_distribution: {
    rating_5: number
    rating_4: number
    rating_3: number
    rating_2: number
    rating_1: number
  }
}

// Categories (can be extended)
export const TUTOR_CATEGORIES = [
  'programming',
  'languages',
  'mathematics',
  'science',
  'history',
  'business',
  'art',
  'music',
  'health',
  'other'
] as const

export type TutorCategory = typeof TUTOR_CATEGORIES[number]

// Review form data
export interface ReviewFormData {
  rating: number
  review_text?: string
}

// Marketplace API responses
export interface MarketplaceTutorsResponse {
  tutors: MarketplaceTutor[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface TutorDetailsResponse {
  tutor: MarketplaceTutor
  statistics: TutorStatistics
  reviews: ReviewWithUser[]
  userReview?: TutorReview | null
}

// View tracking
export interface ViewTrackingData {
  tutor_id: string
  user_id?: string
  session_id?: string
}

