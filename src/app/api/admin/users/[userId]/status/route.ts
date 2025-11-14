/**
 * Admin User Status API
 * 
 * PATCH /api/admin/users/[userId]/status
 * 
 * Enable or disable user account
 * 
 * Body: { action: 'disable' | 'enable', reason?: string }
 * 
 * Access: Super Admin only
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'
import { logAdminAction, getUserRoleById } from '@/lib/auth/roles'
import { RoleInfo } from '@/types/admin'

interface RequestBody {
  action: 'disable' | 'enable'
  reason?: string
}

export const PATCH = withSuperAdmin<{ params: Promise<{ userId: string }> }>(
  async (request: NextRequest, { roleInfo }: { roleInfo: RoleInfo }, segmentParams: { params: Promise<{ userId: string }> }) => {
    try {
      if (!segmentParams) throw new Error("Missing params")
      const { userId } = await segmentParams.params
      const body: RequestBody = await request.json()

      if (!body.action || !['disable', 'enable'].includes(body.action)) {
        return NextResponse.json(
          { error: 'Invalid action. Must be "disable" or "enable"' },
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

      // Prevent disabling super admin
      if (targetUser.role === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot disable super admin' },
          { status: 403 }
        )
      }

      if (body.action === 'disable') {
        // Call disable_user function
        const { data, error } = await supabase.rpc('disable_user', {
          p_user_id: userId,
          p_disabled_by: roleInfo.userId,
          p_reason: body.reason || null,
        })

        if (error) {
          console.error('Error disabling user:', error)
          return NextResponse.json(
            { error: 'Failed to disable user', details: error.message },
            { status: 500 }
          )
        }

        const result = data as { success: boolean; error?: string; message: string }

        if (!result.success) {
          return NextResponse.json(
            { error: result.error || 'Failed to disable user' },
            { status: 400 }
          )
        }

        // Log action
        await logAdminAction({
          adminId: roleInfo.userId,
          action: 'disable_user',
          targetUserId: userId,
          metadata: {
            reason: body.reason,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'User disabled successfully',
        })
      } else {
        // Enable user
        const { data, error } = await supabase.rpc('enable_user', {
          p_user_id: userId,
          p_enabled_by: roleInfo.userId,
        })

        if (error) {
          console.error('Error enabling user:', error)
          return NextResponse.json(
            { error: 'Failed to enable user', details: error.message },
            { status: 500 }
          )
        }

        const result = data as { success: boolean; error?: string; message: string }

        if (!result.success) {
          return NextResponse.json(
            { error: result.error || 'Failed to enable user' },
            { status: 400 }
          )
        }

        // Log action
        await logAdminAction({
          adminId: roleInfo.userId,
          action: 'enable_user',
          targetUserId: userId,
        })

        return NextResponse.json({
          success: true,
          message: 'User enabled successfully',
        })
      }
    } catch (error) {
      console.error('Error in PATCH /api/admin/users/[userId]/status:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

