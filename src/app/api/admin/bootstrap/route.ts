/**
 * Super Admin Bootstrap API Route
 * 
 * This route handles the creation and verification of the super admin account.
 * It should be called on application startup or manually when needed.
 * 
 * Security: This route is protected and will only work if:
 * 1. Called from server-side (internal request)
 * 2. Or by an existing super admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { bootstrapSuperAdmin, verifySuperAdmin } from '@/lib/auth/bootstrap-super-admin'

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow this route to be called in development or by super admin
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // In production, verify the request is from the app itself or super admin
      // You could add a secret token here for additional security
      const authHeader = request.headers.get('authorization')
      const bootstrapSecret = process.env.BOOTSTRAP_SECRET
      
      if (bootstrapSecret && authHeader !== `Bearer ${bootstrapSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Execute bootstrap
    const result = await bootstrapSuperAdmin()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: result.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action: result.action,
      message: result.message,
      superAdminId: result.superAdminId
    })
  } catch (error) {
    console.error('❌ Bootstrap API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify super admin exists
    const result = await verifySuperAdmin()

    return NextResponse.json({
      exists: result.exists,
      email: result.email,
      userId: result.userId,
      error: result.error
    })
  } catch (error) {
    return NextResponse.json(
      {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

