import { NextResponse } from 'next/server';
import { verifyEmailConnection, getEmailServiceStatus } from '@/lib/email/email-service';

/**
 * GET /api/contact/test
 * Test email service configuration
 * - Check if Gmail SMTP is configured
 * - Verify connection
 * - Return detailed status
 * 
 * For development/debugging only
 */
export async function GET() {
  try {
    // Get service status
    const status = getEmailServiceStatus();

    // Try to verify connection
    const connectionValid = await verifyEmailConnection();

    // Get admin emails
    const adminEmails = process.env.ADMIN_EMAILS 
      ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
      : [process.env.GMAIL_USER || 'Not configured'];

    // Build detailed response
    const response = {
      emailService: {
        configured: status.configured,
        service: status.service,
        user: status.user || 'Not configured',
        dailyLimit: status.dailyLimit,
      },
      connection: {
        valid: connectionValid,
        tested: true,
      },
      adminEmails: {
        configured: !!process.env.ADMIN_EMAILS,
        emails: adminEmails,
        count: adminEmails.length,
      },
      environmentVariables: {
        GMAIL_USER: process.env.GMAIL_USER ? '✅ Set' : '❌ Not set',
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set',
        ADMIN_EMAILS: process.env.ADMIN_EMAILS ? '✅ Set' : '❌ Not set (using GMAIL_USER)',
        NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL ? '✅ Set' : '❌ Not set',
      },
      recommendation: getRecommendation(status.configured, connectionValid),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Email test error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to test email service',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getRecommendation(configured: boolean, connectionValid: boolean): string {
  if (!configured) {
    return '⚠️ Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables. See docs/CONTACT_FORM_SETUP.md for instructions.';
  }

  if (!connectionValid) {
    return '❌ Gmail SMTP configured but connection failed. Verify your GMAIL_APP_PASSWORD is correct and your Gmail account has 2FA enabled.';
  }

  return '✅ Email service is properly configured and working!';
}

// Mark as dynamic
export const dynamic = 'force-dynamic';

