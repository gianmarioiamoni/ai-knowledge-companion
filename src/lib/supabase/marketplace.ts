/**
 * Marketplace Service
 * Handles all marketplace-related operations: listing, filtering, reviews, forks
 */

import { createClient } from './client'
import type {
  MarketplaceTutor,
  MarketplaceQuery,
  MarketplaceTutorsResponse,
  TutorDetailsResponse,
  ReviewFormData,
  ForkResult,
  TutorStatistics,
  ReviewWithUser,
  ViewTrackingData
} from '@/types/marketplace'
import type { Tutor, TutorReview } from '@/types/database'

/**
 * Get marketplace tutors with filters and sorting
 */
export async function getMarketplaceTutors(
  query: MarketplaceQuery = {}
): Promise<{ data?: MarketplaceTutorsResponse; error?: string }> {
  try {
    const supabase = createClient()
    const {
      filters = {},
      sort_by = 'newest',
      limit = 20,
      offset = 0
    } = query

    // Build query
    let dbQuery = supabase
      .from('tutors')
      .select('*', { count: 'exact' })
      .eq('visibility', 'marketplace')

    // Apply filters
    if (filters.category) {
      dbQuery = dbQuery.eq('category', filters.category)
    }

    if (filters.is_free !== undefined && filters.is_free !== null) {
      dbQuery = dbQuery.eq('is_free', filters.is_free)
    }

    if (filters.min_rating) {
      dbQuery = dbQuery.gte('rating_average', filters.min_rating)
    }

    if (filters.max_price) {
      dbQuery = dbQuery.lte('price', filters.max_price)
    }

    if (filters.tags && filters.tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', filters.tags)
    }

    if (filters.search) {
      dbQuery = dbQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    switch (sort_by) {
      case 'rating':
        dbQuery = dbQuery.order('rating_average', { ascending: false })
        break
      case 'downloads':
        dbQuery = dbQuery.order('downloads_count', { ascending: false })
        break
      case 'popular':
        dbQuery = dbQuery.order('forks_count', { ascending: false })
        break
      case 'price_low':
        dbQuery = dbQuery.order('price', { ascending: true })
        break
      case 'price_high':
        dbQuery = dbQuery.order('price', { ascending: false })
        break
      case 'newest':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data, error, count } = await dbQuery

    if (error) {
      console.error('Error fetching marketplace tutors:', error)
      return { error: error.message }
    }

    // Fetch owner profiles separately
    const ownerIds = [...new Set((data || []).map(t => t.owner_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', ownerIds)

    const profilesMap = new Map(
      (profiles || []).map(p => [p.id, p.display_name])
    )

    // Transform data
    const tutors: MarketplaceTutor[] = (data || []).map((tutor: Tutor) => ({
      ...tutor,
      owner_display_name: profilesMap.get(tutor.owner_id) || 'Anonymous'
    }))

    const total = count || 0
    const page = Math.floor(offset / limit) + 1
    const hasMore = offset + limit < total

    return {
      data: {
        tutors,
        total,
        page,
        limit,
        hasMore
      }
    }
  } catch (error) {
    console.error('Exception in getMarketplaceTutors:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch marketplace tutors'
    }
  }
}

/**
 * Get tutor details with statistics and reviews
 */
export async function getTutorDetails(
  tutorId: string,
  userId?: string
): Promise<{ data?: TutorDetailsResponse; error?: string }> {
  try {
    const supabase = createClient()

    // Fetch tutor
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('id', tutorId)
      .single()

    if (tutorError) {
      return { error: tutorError.message }
    }

    if (!tutor) {
      return { error: 'Tutor not found' }
    }

    // Fetch owner profile
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', tutor.owner_id)
      .single()

    // Transform tutor data
    const marketplaceTutor: MarketplaceTutor = {
      ...tutor,
      owner_display_name: ownerProfile?.display_name || 'Anonymous'
    }

    // Fetch statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_tutor_stats', { p_tutor_id: tutorId })
      .single()

    const statistics: TutorStatistics = stats || {
      total_views: 0,
      unique_viewers: 0,
      total_forks: 0,
      total_reviews: 0,
      rating_distribution: {
        rating_5: 0,
        rating_4: 0,
        rating_3: 0,
        rating_2: 0,
        rating_1: 0
      }
    }

    // Fetch reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('tutor_reviews')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Fetch review authors' profiles
    const reviewUserIds = [...new Set((reviews || []).map(r => r.user_id))]
    const { data: reviewProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', reviewUserIds)

    const reviewProfilesMap = new Map(
      (reviewProfiles || []).map(p => [p.id, p])
    )

    const reviewsWithUser: ReviewWithUser[] = (reviews || []).map((review: TutorReview) => {
      const profile = reviewProfilesMap.get(review.user_id)
      return {
        ...review,
        user_display_name: profile?.display_name || 'Anonymous',
        user_avatar_url: profile?.avatar_url
      }
    })

    // Fetch user's review if logged in
    let userReview: TutorReview | null = null
    if (userId) {
      const { data: review } = await supabase
        .from('tutor_reviews')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('user_id', userId)
        .single()

      userReview = review
    }

    return {
      data: {
        tutor: marketplaceTutor,
        statistics,
        reviews: reviewsWithUser,
        userReview
      }
    }
  } catch (error) {
    console.error('Exception in getTutorDetails:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch tutor details'
    }
  }
}

/**
 * Create or update a review
 */
export async function upsertReview(
  tutorId: string,
  userId: string,
  reviewData: ReviewFormData
): Promise<{ data?: TutorReview; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tutor_reviews')
      .upsert({
        tutor_id: tutorId,
        user_id: userId,
        rating: reviewData.rating,
        review_text: reviewData.review_text || null
      }, {
        onConflict: 'tutor_id,user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting review:', error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Exception in upsertReview:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to save review'
    }
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  tutorId: string,
  userId: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('tutor_reviews')
      .delete()
      .eq('tutor_id', tutorId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting review:', error)
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Exception in deleteReview:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to delete review'
    }
  }
}

/**
 * Fork a tutor (duplicate with reference to original)
 */
export async function forkTutor(
  originalTutorId: string,
  userId: string,
  newName?: string
): Promise<ForkResult> {
  try {
    const supabase = createClient()

    // Fetch original tutor
    const { data: originalTutor, error: fetchError } = await supabase
      .from('tutors')
      .select('*')
      .eq('id', originalTutorId)
      .single()

    if (fetchError || !originalTutor) {
      return {
        success: false,
        error: 'Original tutor not found'
      }
    }

    // Check if tutor is forkable (public or marketplace)
    if (originalTutor.visibility === 'private') {
      return {
        success: false,
        error: 'Cannot fork private tutor'
      }
    }

    // Create forked tutor
    const forkedTutorData = {
      owner_id: userId,
      name: newName || `${originalTutor.name} (Fork)`,
      description: originalTutor.description,
      config: originalTutor.config,
      category: originalTutor.category,
      tags: originalTutor.tags,
      visibility: 'private' as const, // Forks start as private
      original_tutor_id: originalTutorId
    }

    const { data: forkedTutor, error: createError } = await supabase
      .from('tutors')
      .insert(forkedTutorData)
      .select()
      .single()

    if (createError || !forkedTutor) {
      console.error('Error creating forked tutor:', createError)
      return {
        success: false,
        error: 'Failed to create fork'
      }
    }

    // Copy tutor-document relationships
    const { data: tutorDocs } = await supabase
      .from('tutor_documents')
      .select('document_id')
      .eq('tutor_id', originalTutorId)

    if (tutorDocs && tutorDocs.length > 0) {
      const newTutorDocs = tutorDocs.map(doc => ({
        tutor_id: forkedTutor.id,
        document_id: doc.document_id
      }))

      await supabase
        .from('tutor_documents')
        .insert(newTutorDocs)
    }

    // Create fork record
    const { data: forkRecord, error: forkError } = await supabase
      .from('tutor_forks')
      .insert({
        original_tutor_id: originalTutorId,
        forked_tutor_id: forkedTutor.id,
        user_id: userId
      })
      .select()
      .single()

    if (forkError) {
      console.error('Error creating fork record:', forkError)
      // Fork was created but tracking failed - not critical
    }

    return {
      success: true,
      forked_tutor: forkedTutor,
      fork_record: forkRecord || undefined
    }
  } catch (error) {
    console.error('Exception in forkTutor:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fork tutor'
    }
  }
}

/**
 * Track a tutor view
 */
export async function trackTutorView(
  viewData: ViewTrackingData
): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('tutor_views')
      .insert({
        tutor_id: viewData.tutor_id,
        user_id: viewData.user_id || null,
        session_id: viewData.session_id || null
      })

    if (error) {
      console.error('Error tracking tutor view:', error)
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Exception in trackTutorView:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to track view'
    }
  }
}

/**
 * Get categories with tutor counts
 */
export async function getCategoriesWithCounts(): Promise<{
  data?: Array<{ category: string; count: number }>
  error?: string
}> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tutors')
      .select('category')
      .eq('visibility', 'marketplace')
      .not('category', 'is', null)

    if (error) {
      return { error: error.message }
    }

    // Count categories
    const categoryCounts = (data || []).reduce((acc: Record<string, number>, item) => {
      const category = item.category || 'other'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    const categories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    return { data: categories }
  } catch (error) {
    console.error('Exception in getCategoriesWithCounts:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get categories'
    }
  }
}

/**
 * Increment helpful count for a review
 */
export async function markReviewHelpful(
  reviewId: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .rpc('increment_review_helpful', { review_id: reviewId })

    if (error) {
      console.error('Error marking review helpful:', error)
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Exception in markReviewHelpful:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to mark review helpful'
    }
  }
}

