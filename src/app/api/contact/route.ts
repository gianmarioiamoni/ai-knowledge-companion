import { NextRequest, NextResponse } from 'next/server';
import { contactRequestSchema } from '@/lib/schemas/contact';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/contact
 * Handle contact form submissions
 * - Validate form data
 * - Save message to database
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
    let userId: string | null = null;

    // If user claims to be authenticated, verify it
    if (data.isAuthenticated) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // If verification fails, treat as guest but continue
      if (authError || !user) {
        console.warn('Contact form: User claimed authenticated but verification failed');
        data.isAuthenticated = false;
      } else {
        // Use authenticated user's email and ID
        userId = user.id;
        data.email = user.email || data.email;
      }
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || undefined;

    // Save message to database using service client (bypasses RLS)
    const serviceClient = createServiceClient();
    const { data: savedMessage, error: saveError } = await serviceClient
      .from('contact_messages')
      .insert({
        user_id: userId,
        name: data.name,
        email: data.email,
        subject: data.subject,
        category: data.category,
        message: data.message,
        is_authenticated: data.isAuthenticated,
        user_agent: userAgent,
        ip_address: ipAddress,
        status: 'pending',
        priority: 'normal',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save contact message:', saveError);
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully. We will respond within 2 business days.',
        data: {
          id: savedMessage.id,
          created_at: savedMessage.created_at,
        }
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

