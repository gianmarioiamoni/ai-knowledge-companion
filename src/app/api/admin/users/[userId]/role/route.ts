/**
 * Admin User Role API
 * 
 * PATCH /api/admin/users/[userId]/role
 * 
 * Promote user to admin or demote admin to user
 * 
 * Body: { action: 'promote' | 'demote' }
 * 
 * Access: Super Admin only
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'
import { logAdminAction, getUserRoleById } from '@/lib/auth/roles'

interface RouteParams {
  params: Promise<{ userId: string }>
}

interface RequestBody {
  action: 'promote' | 'demote'
}

export const PATCH = withSuperAdmin(
  async (request: NextRequest, { roleInfo }, context: RouteParams) => {
    try {
      const { userId } = await context.params
      const body: RequestBody = await request.json()

      if (!body.action || !['promote', 'demote'].includes(body.action)) {
        return NextResponse.json(
          { error: 'Invalid action. Must be "promote" or "demote"' },
          { status: 400 }
        )
      }

      const supabase = createServiceClient()

      // Get target user info
      const targetUser = await getUserRoleById(userId)

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      if (body.action === 'promote') {
        // Promote user to admin
        if (targetUser.role !== 'user') {
          return NextResponse.json(
            { error: 'User is already an admin or super admin' },
            { status: 400 }
          )
        }

        // Call promote_user_to_admin function
        const { data, error } = await supabase.rpc('promote_user_to_admin', {
          p_user_id: userId,
          p_promoted_by: roleInfo.userId,
        })

        if (error) {
          console.error('Error promoting user:', error)
          return NextResponse.json(
            { error: 'Failed to promote user', details: error.message },
            { status: 500 }
          )
        }

        const result = data as { success: boolean; error?: string; message: string }

        if (!result.success) {
          return NextResponse.json(
            { error: result.error || 'Failed to promote user' },
            { status: 400 }
          )
        }

        // Log action
        await logAdminAction({
          adminId: roleInfo.userId,
          action: 'promote_admin',
          targetUserId: userId,
          metadata: {
            previousRole: 'user',
            newRole: 'admin',
          },
        })

        return NextResponse.json({
          success: true,
          message: 'User promoted to admin successfully',
        })
      } else {
        // Demote admin to user
        if (targetUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'User is not an admin or is super admin (cannot be demoted)' },
            { status: 400 }
          )
        }

        // Call demote_admin_to_user function
        const { data, error } = await supabase.rpc('demote_admin_to_user', {
          p_user_id: userId,
          p_demoted_by: roleInfo.userId,
        })

        if (error) {
          console.error('Error demoting admin:', error)
          return NextResponse.json(
            { error: 'Failed to demote admin', details: error.message },
            { status: 500 }
          )
        }

        const result = data as { success: boolean; error?: string; message: string }

        if (!result.success) {
          return NextResponse.json(
            { error: result.error || 'Failed to demote admin' },
            { status: 400 }
          )
        }

        // Log action
        await logAdminAction({
          adminId: roleInfo.userId,
          action: 'demote_admin',
          targetUserId: userId,
          metadata: {
            previousRole: 'admin',
            newRole: 'user',
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Admin demoted to user successfully',
        })
      }
    } catch (error) {
      console.error('Error in PATCH /api/admin/users/[userId]/role:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

