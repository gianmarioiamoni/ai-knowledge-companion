/**
 * Marketplace API - Categories
 * GET /api/marketplace/categories
 * Returns available categories with tutor counts
 */

import { NextResponse } from 'next/server'
import { getCategoriesWithCounts } from '@/lib/supabase/marketplace'

export async function GET() {
  try {
    const result = await getCategoriesWithCounts()

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      categories: result.data || []
    })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

