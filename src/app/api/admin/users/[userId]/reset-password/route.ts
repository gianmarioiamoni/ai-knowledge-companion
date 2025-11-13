/**
 * Admin Reset User Password API
 * 
 * POST /api/admin/users/[userId]/reset-password
 * 
 * Sends password reset email to user
 * 
 * Access: Admin, Super Admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'
import { logAdminAction, getUserRoleById } from '@/lib/auth/roles'
import { RoleInfo, UserRouteParams } from '@/types/admin'

export const POST = withAdmin(
  async (request: NextRequest, { roleInfo }: { roleInfo: RoleInfo }, context: UserRouteParams) => {
    try {
      const { userId } = await context.params
      const supabase = createServiceClient()

      // Get target user info
      const targetUser = await getUserRoleById(userId)

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Admin can only reset password for regular users
      if (roleInfo.role === 'admin' && targetUser.role !== 'user') {
        return NextResponse.json(
          { error: 'Admins can only reset passwords for regular users' },
          { status: 403 }
        )
      }

      // Generate password reset link
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: targetUser.email!,
      })

      if (error) {
        console.error('Error generating password reset link:', error)
        return NextResponse.json(
          { error: 'Failed to generate password reset link', details: error.message },
          { status: 500 }
        )
      }

      // In a production environment, you would send this link via email
      // For now, we return it (remove this in production!)
      const resetLink = data.properties?.action_link

      // Log action
      await logAdminAction({
        adminId: roleInfo.userId,
        action: 'reset_password',
        targetUserId: userId,
        metadata: {
          targetEmail: targetUser.email,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Password reset link generated successfully',
        resetLink, // Remove in production - send via email instead
      })
    } catch (error) {
      console.error('Error in POST /api/admin/users/[userId]/reset-password:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

