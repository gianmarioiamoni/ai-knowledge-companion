/**
 * Admin Users API
 * 
 * GET  /api/admin/users - List all users with stats
 * 
 * Access: Admin, Super Admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'

export const GET = withAdmin(async (request: NextRequest, { roleInfo }) => {
  try {
    const supabase = createServiceClient()

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('admin_user_stats')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,display_name.ilike.%${search}%`
      )
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    // Get summary stats
    const { data: summary } = await supabase
      .from('profiles')
      .select('role, status', { count: 'exact' })

    const stats = {
      total: count || 0,
      active: users?.filter((u) => u.status === 'active').length || 0,
      disabled: users?.filter((u) => u.status === 'disabled').length || 0,
      users: users?.filter((u) => u.role === 'user').length || 0,
      admins: users?.filter((u) => u.role === 'admin').length || 0,
      superAdmins: users?.filter((u) => u.role === 'super_admin').length || 0,
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

