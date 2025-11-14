import { NextRequest, NextResponse } from 'next/server';
import { contactRequestSchema } from '@/lib/schemas/contact';
import { createClient } from '@/lib/supabase/server';
import { 
  sendContactAdminNotification, 
  sendContactUserConfirmation 
} from '@/lib/email/contact-notifications';
import { 
  checkRateLimit, 
  recordSubmission, 
  logContactSubmission 
} from '@/lib/email/contact-rate-limiter';

/**
 * POST /api/contact
 * Handle contact form submissions with email notifications
 * 
 * Flow:
 * 1. Validate form data
 * 2. Check rate limiting (5 messages per email per 24h)
 * 3. Send emails (admin notification + user confirmation)
 * 4. Log submission (minimal metadata, no database storage)
 * 
 * Public route (accessible to authenticated and unauthenticated users)
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
        console.warn('⚠️ Contact form: User claimed authenticated but verification failed');
        data.isAuthenticated = false;
      } else {
        // Use authenticated user's email
        data.email = user.email || data.email;
      }
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(data.email);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimit.retryAfter,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // Prepare email data
    const timestamp = new Date().toLocaleString('it-IT', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const emailData = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      category: data.category,
      message: data.message,
      isAuthenticated: data.isAuthenticated,
      timestamp,
    };

    // Send emails (non-blocking, don't fail if emails fail)
    const [adminResult, userResult] = await Promise.allSettled([
      sendContactAdminNotification(emailData),
      sendContactUserConfirmation(emailData),
    ]);

    // Check if at least admin email was sent successfully
    const adminSent = adminResult.status === 'fulfilled' && adminResult.value === true;
    const userSent = userResult.status === 'fulfilled' && userResult.value === true;

    // Log the results
    if (!adminSent) {
      console.warn('⚠️ Admin notification email failed');
    }
    if (!userSent) {
      console.warn('⚠️ User confirmation email failed');
    }

    // Record submission for rate limiting (only if email sent successfully)
    if (adminSent || userSent) {
      recordSubmission(data.email);
    }

    // Log submission metadata (for monitoring, no database)
    logContactSubmission({
      email: data.email,
      category: data.category,
      isAuthenticated: data.isAuthenticated,
      emailSent: adminSent || userSent,
      timestamp: new Date().toISOString(),
    });

    // Return success (even if emails failed, we logged the attempt)
    // In production with Gmail configured, emails should always succeed
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully. We will respond within 2 business days.',
        data: {
          emailSent: adminSent || userSent,
          remaining: rateLimit.remaining - 1,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Export config to mark route as public (no authentication required)
export const dynamic = 'force-dynamic';

