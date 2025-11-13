/**
 * Admin Tutor Visibility API
 * 
 * PATCH /api/admin/tutors/[tutorId]/visibility
 * 
 * Change tutor visibility (e.g. remove from marketplace if violates policy)
 * 
 * Body: { visibility: 'private' | 'public' | 'marketplace', reason?: string }
 * 
 * Access: Super Admin only
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'
import { logAdminAction } from '@/lib/auth/roles'
import { RoleInfo, TutorRouteParams } from '@/types/admin'

interface RequestBody {
  visibility: 'private' | 'public' | 'marketplace'
  reason?: string
}

export const PATCH = withSuperAdmin(
  async (request: NextRequest, { roleInfo }: { roleInfo: RoleInfo }, context: TutorRouteParams) => {
    try {
      const { tutorId } = await context.params
      const body: RequestBody = await request.json()

      if (!body.visibility || !['private', 'public', 'marketplace'].includes(body.visibility)) {
        return NextResponse.json(
          { error: 'Invalid visibility value' },
          { status: 400 }
        )
      }

      const supabase = createServiceClient()

      // Get tutor info
      const { data: tutor, error: tutorError } = await supabase
        .from('tutors')
        .select('id, name, owner_id, visibility')
        .eq('id', tutorId)
        .single()

      if (tutorError || !tutor) {
        return NextResponse.json(
          { error: 'Tutor not found' },
          { status: 404 }
        )
      }

      // Update visibility
      const { error: updateError } = await supabase
        .from('tutors')
        .update({
          visibility: body.visibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tutorId)

      if (updateError) {
        console.error('Error updating tutor visibility:', updateError)
        return NextResponse.json(
          { error: 'Failed to update tutor visibility', details: updateError.message },
          { status: 500 }
        )
      }

      // Log action
      await logAdminAction({
        adminId: roleInfo.userId,
        action: 'edit_tutor_visibility',
        targetUserId: tutor.owner_id,
        targetResourceId: tutorId,
        metadata: {
          tutorName: tutor.name,
          previousVisibility: tutor.visibility,
          newVisibility: body.visibility,
          reason: body.reason,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Tutor visibility updated successfully',
        tutor: {
          id: tutorId,
          name: tutor.name,
          visibility: body.visibility,
        },
      })
    } catch (error) {
      console.error('Error in PATCH /api/admin/tutors/[tutorId]/visibility:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

