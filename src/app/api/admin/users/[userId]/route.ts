/**
 * Admin Single User API
 * 
 * GET    /api/admin/users/[userId] - Get user details
 * DELETE /api/admin/users/[userId] - Delete user
 * 
 * Access: Admin (view only), Super Admin (all)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, withSuperAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'
import { logAdminAction, getUserRoleById } from '@/lib/auth/roles'
import { RoleInfo } from '@/types/admin'

export const GET = withAdmin<{ params: Promise<{ userId: string }> }>(async (request: NextRequest, { roleInfo: _roleInfo }: { roleInfo: RoleInfo }, segmentParams: { params: Promise<{ userId: string }> }) => {
  try {
    if (!segmentParams) throw new Error("Missing params")
      const { userId } = await segmentParams.params
    const supabase = createServiceClient()

    // Get user details from admin_user_stats view
    const { data: user, error } = await supabase
      .from('admin_user_stats')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get audit log for this user (last 50 actions)
    const { data: auditLog } = await supabase
      .from('admin_audit_log')
      .select('*')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({
      user,
      auditLog: auditLog || [],
    })
  } catch (error) {
    console.error('Error in GET /api/admin/users/[userId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = withSuperAdmin<{ params: Promise<{ userId: string }> }>(
  async (request: NextRequest, { roleInfo }: { roleInfo: RoleInfo }, segmentParams: { params: Promise<{ userId: string }> }) => {
    try {
      if (!segmentParams) throw new Error("Missing params")
      const { userId } = await segmentParams.params
      const supabase = createServiceClient()

      // Get user info before deletion
      const targetUser = await getUserRoleById(userId)

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Prevent deleting super admin
      if (targetUser.role === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot delete super admin' },
          { status: 403 }
        )
      }

      // Delete user using admin API (cascades to all related data via FK)
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
          { error: 'Failed to delete user', details: error.message },
          { status: 500 }
        )
      }

      // Log action
      await logAdminAction({
        adminId: roleInfo.userId,
        action: 'delete_user',
        targetUserId: userId,
        metadata: {
          deletedUser: {
            email: targetUser.email,
            role: targetUser.role,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      console.error('Error in DELETE /api/admin/users/[userId]:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

