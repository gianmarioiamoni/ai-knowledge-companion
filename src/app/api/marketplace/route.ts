/**
 * Marketplace API - Listing
 * GET /api/marketplace
 * Returns marketplace tutors with filters and sorting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMarketplaceTutors } from '@/lib/supabase/marketplace'
import type { MarketplaceQuery } from '@/types/marketplace'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const query: MarketplaceQuery = {
      filters: {
        category: searchParams.get('category') || undefined,
        is_free: searchParams.get('is_free') === 'true' ? true : 
                 searchParams.get('is_free') === 'false' ? false : undefined,
        min_rating: searchParams.get('min_rating') 
          ? parseFloat(searchParams.get('min_rating')!) 
          : undefined,
        max_price: searchParams.get('max_price') 
          ? parseFloat(searchParams.get('max_price')!) 
          : undefined,
        tags: searchParams.get('tags') 
          ? searchParams.get('tags')!.split(',') 
          : undefined,
        search: searchParams.get('search') || undefined
      },
      sort_by: (searchParams.get('sort_by') || 'newest') as any,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!) 
        : 20,
      offset: searchParams.get('offset') 
        ? parseInt(searchParams.get('offset')!) 
        : 0
    }

    const result = await getMarketplaceTutors(query)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Marketplace API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

