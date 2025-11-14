import { Resend } from 'resend';

// Email sender configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  isAuthenticated: boolean;
}

/**
 * Send email notification to admins about new contact form submission
 */
export async function sendAdminNotification(data: ContactEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const categoryLabel = getCategoryLabel(data.category);
    const userType = data.isAuthenticated ? 'Authenticated User' : 'Guest';

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[Contact Form] ${categoryLabel}: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>User Type:</strong> ${userType}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Category:</strong> ${categoryLabel}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3 style="color: #555; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0; color: #1976d2;">
              <strong>📅 Expected Response:</strong> Within 2 business days
            </p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error('Failed to send admin notification:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Send confirmation email to the user
 */
export async function sendUserConfirmation(data: ContactEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const categoryLabel = getCategoryLabel(data.category);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `We received your message: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank You for Contacting Us!</h2>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Hi ${data.name},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            We have received your message and our team will review it shortly. 
            We aim to respond within <strong>2 business days</strong>.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Category:</strong> ${categoryLabel}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p style="margin-bottom: 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6; margin-top: 5px;">${data.message}</p>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.6;">
            If you need immediate assistance, please check our 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" style="color: #1976d2;">Help Center</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #999;">
            This is an automated confirmation email. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Failed to send user confirmation:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending user confirmation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Helper function to get human-readable category label
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    general: 'General Inquiry',
    support: 'Technical Support',
    bug: 'Bug Report',
    feature: 'Feature Request',
    billing: 'Billing Question',
    other: 'Other',
  };
  return labels[category] || category;
}

