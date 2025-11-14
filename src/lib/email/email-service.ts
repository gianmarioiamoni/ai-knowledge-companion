/**
 * Email Service using Nodemailer + Gmail SMTP
 * Functional approach with lazy initialization and graceful degradation
 */

import type { Transporter } from 'nodemailer';
import { sanitize } from '@/lib/utils/log-sanitizer';

export interface EmailOptions {
  to: string | string[]; // Support multiple recipients
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface EmailServiceStatus {
  configured: boolean;
  service: string;
  user?: string;
  dailyLimit: number;
}

// Module-level state (encapsulated)
let transporter: Transporter | null = null;
let isConfigured = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize Gmail SMTP transporter
 * Uses lazy initialization pattern for performance
 */
async function initializeTransporter(): Promise<void> {
  try {
    // Check if Gmail SMTP is configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.warn('📧 Gmail SMTP not configured - email sending disabled');
      console.warn('📧 Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables');
      console.warn('📧 Contact form will still work, but emails won\'t be sent');
      return;
    }

    // Dynamic import of nodemailer (server-side only)
    const nodemailer = await import('nodemailer');

    // Create Gmail SMTP transporter
    transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    isConfigured = true;
    console.log('✅ Gmail SMTP configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Gmail SMTP:', sanitize(error));
  }
}

/**
 * Ensure email service is initialized
 * Thread-safe singleton initialization
 */
async function ensureInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeTransporter();
  }
  await initializationPromise;
}

/**
 * Send email using Gmail SMTP
 * Graceful degradation: logs email content if service not configured
 * 
 * @param options - Email options
 * @returns Promise<boolean> - true if email sent successfully, false otherwise
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Ensure service is initialized
    await ensureInitialized();

    if (!isConfigured || !transporter) {
      console.warn('📧 Email service not configured - logging email instead');
      console.info('📧 To:', sanitize(options.to));
      console.info('📧 Subject:', options.subject);
      console.info('📧 Text preview:', options.text.substring(0, 200) + '...');
      
      // In development, this is acceptable behavior
      // In production, you should configure Gmail SMTP
      return false;
    }

    // Prepare email
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    // Send email via Gmail SMTP
    const info = await transporter.sendMail({
      from: `AI Knowledge Companion <${process.env.GMAIL_USER}>`,
      to: recipients.join(', '),
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });

    console.info('✅ Email sent successfully');
    console.info('📧 To:', sanitize(recipients));
    console.info('📧 Subject:', options.subject);
    console.info('📧 Message ID:', info.messageId);

    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', sanitize(error));
    
    // Fallback to logging (graceful degradation)
    console.warn('📧 Fallback - logging email content:');
    console.info('📧 To:', sanitize(options.to));
    console.info('📧 Subject:', options.subject);
    console.info('📧 Text preview:', options.text.substring(0, 200));
    
    return false;
  }
}

/**
 * Verify email service configuration and connection
 * Useful for health checks and debugging
 * 
 * @returns Promise<boolean> - true if connection is valid
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    // Ensure service is initialized
    await ensureInitialized();

    if (!transporter) {
      console.warn('📧 Email service not configured');
      return false;
    }

    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP verification failed:', sanitize(error));
    return false;
  }
}

/**
 * Get email service status
 * Useful for admin dashboards and monitoring
 * 
 * @returns EmailServiceStatus - Current service configuration
 */
export function getEmailServiceStatus(): EmailServiceStatus {
  return {
    configured: isConfigured,
    service: 'Gmail SMTP',
    user: process.env.GMAIL_USER,
    dailyLimit: 500, // Gmail free tier limit
  };
}

/**
 * Send multiple emails in batch
 * Useful for admin notifications to multiple recipients
 * 
 * @param emails - Array of email options
 * @returns Promise<{sent: number, failed: number}> - Batch send results
 */
export async function sendBatchEmails(
  emails: EmailOptions[]
): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value === true
  ).length;
  const failed = results.length - sent;

  console.info(`📧 Batch send complete: ${sent} sent, ${failed} failed`);

  return { sent, failed };
}

