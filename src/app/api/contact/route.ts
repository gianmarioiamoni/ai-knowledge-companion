import { NextRequest, NextResponse } from 'next/server';
import { contactRequestSchema } from '@/lib/schemas/contact';
import { sendAdminNotification, sendUserConfirmation } from '@/lib/email/resend';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/contact
 * Handle contact form submissions
 * - Validate form data
 * - Send notification email to admins
 * - Send confirmation email to user
 * - Public route (accessible to authenticated and unauthenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validation = contactRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If user claims to be authenticated, verify it
    if (data.isAuthenticated) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // If verification fails, treat as guest but continue
      if (authError || !user) {
        console.warn('Contact form: User claimed authenticated but verification failed');
        data.isAuthenticated = false;
      } else {
        // Use authenticated user's email
        data.email = user.email || data.email;
      }
    }

    // Send email notifications
    const [adminResult, userResult] = await Promise.allSettled([
      sendAdminNotification(data),
      sendUserConfirmation(data),
    ]);

    // Check admin notification result (critical)
    if (adminResult.status === 'rejected') {
      console.error('Failed to send admin notification:', adminResult.reason);
      return NextResponse.json(
        { error: 'Failed to send notification to administrators' },
        { status: 500 }
      );
    }

    if (!adminResult.value.success) {
      console.error('Admin notification failed:', adminResult.value.error);
      return NextResponse.json(
        { error: 'Failed to send notification to administrators' },
        { status: 500 }
      );
    }

    // Check user confirmation result (non-critical, log but don't fail)
    if (userResult.status === 'rejected') {
      console.error('Failed to send user confirmation:', userResult.reason);
    } else if (!userResult.value.success) {
      console.error('User confirmation failed:', userResult.value.error);
    }

    // Return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully. We will respond within 2 business days.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Export config to mark route as public (no authentication required)
export const dynamic = 'force-dynamic';

