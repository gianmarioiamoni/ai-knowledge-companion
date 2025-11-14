# Contact Form Setup Guide - Email-First Approach

This document explains how to configure the contact form feature of AI Knowledge Companion using an email-first architecture with Nodemailer + Gmail SMTP.

## Overview

The contact form allows both authenticated and unauthenticated users to send inquiries, report issues, or request support. All submissions result in:
- **Email to administrators**: Instant notification with full message details
- **Email to user**: Automatic confirmation with expected response time
- **Minimal logging**: In-memory rate limiting and console logs (no database storage)

### Why Email-First?

✅ **Simplicity**: No database tables to maintain  
✅ **Privacy**: Messages don't persist in database (GDPR-friendly)  
✅ **Familiarity**: Traditional email workflow for admins  
✅ **Zero config**: Works out of the box with Gmail  
✅ **Scalable**: 500 emails/day limit is sufficient for most use cases

---

## Features

- ✅ Accessible to both authenticated and unauthenticated users
- ✅ Auto-fills email for authenticated users
- ✅ Multiple inquiry categories (General, Support, Bug, Feature Request, Billing, Other)
- ✅ **Email notifications** to admin(s) with beautiful HTML templates
- ✅ **Confirmation emails** to users with branding
- ✅ **Rate limiting**: Max 5 messages per email per 24 hours (in-memory)
- ✅ **Graceful degradation**: Works without Gmail config (logs to console)
- ✅ Fully responsive design
- ✅ Multilingual support (English & Italian)
- ✅ Form validation with Zod
- ✅ SRP-compliant component architecture

---

## Email Service Setup

### Step 1: Get Gmail App Password

1. **Go to your Google Account**:
   - Visit [myaccount.google.com](https://myaccount.google.com)

2. **Enable 2-Step Verification** (required):
   - Security → 2-Step Verification
   - Follow the setup wizard

3. **Generate App Password**:
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AI Knowledge Companion"
   - **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Configure Environment Variables

Add these to your `.env.local` (development) and Vercel Environment Variables (production):

```env
# Gmail SMTP Configuration (Required for email sending)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword

# Admin Email(s) - Comma-separated for multiple admins
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Optional: Public contact email (displayed on contact page)
NEXT_PUBLIC_CONTACT_EMAIL=contact@yourdomain.com

# Optional: App URL for email links
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GMAIL_USER` | Your Gmail address | ✅ Yes | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-char app password from Google | ✅ Yes | `abcd efgh ijkl mnop` |
| `ADMIN_EMAILS` | Admin email(s) to receive notifications | ✅ Yes | `admin@example.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email displayed on contact page | ❌ No | `contact@yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | App URL for email links | ❌ No | `https://yourdomain.com` |

**Notes**:
- If `ADMIN_EMAILS` is not set, falls back to `GMAIL_USER`
- Multiple admins: separate with commas
- App password must be from Google account (no spaces when setting)

---

## Setup Complete!

✅ With Gmail configured, you're ready to receive contact form submissions via email!  
⚠️ Without Gmail, the form will still work but emails will be logged to console only.

---

## Testing the Contact Form

### Local Testing (Without Gmail)

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to contact page**:
   - Authenticated: `http://localhost:3000/en/contact`
   - Unauthenticated: Log out and visit same URL

3. **Submit a test message**:
   - Form will work normally
   - Check console logs for email content
   - You'll see: `📧 Email service not configured - logging email instead`

4. **Test scenarios**:
   - ✅ Submit as authenticated user (email auto-filled)
   - ✅ Submit as guest user (email required)
   - ✅ Test form validation (empty fields, invalid email)
   - ✅ Test rate limiting (try 6 messages in a row)

### Local Testing (With Gmail)

1. **Configure Gmail** (see Setup section above)

2. **Add to `.env.local`**:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=yourapppassword
   ADMIN_EMAILS=your-email@gmail.com
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Submit a test message**:
   - Check your Gmail inbox for admin notification
   - Check test email for user confirmation
   - Verify both emails arrived with correct formatting

5. **Test email features**:
   - ✅ Admin receives notification with "Reply" button
   - ✅ User receives confirmation with dashboard link
   - ✅ HTML templates render correctly
   - ✅ Categories display with emojis
   - ✅ Timestamps are localized (Italian format)

### Production Testing

1. **Add environment variables to Vercel**:
   - Settings → Environment Variables
   - Add `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAILS`
   - Redeploy application

2. **Test on production**:
   - Visit `https://yourdomain.com/en/contact`
   - Submit a test inquiry
   - Verify emails received

3. **Monitor logs**:
   ```bash
   vercel logs --follow
   ```
   - Look for `✅ Email sent successfully`
   - Check for any error messages

---

## Troubleshooting

### Emails Not Sent

**Problem**: Form submits but no emails received

**Solutions**:
1. **Check environment variables**:
   ```bash
   # In server logs, look for:
   📧 Gmail SMTP not configured - email sending disabled
   ```
   
2. **Verify Gmail app password**:
   - Must be 16 characters
   - No spaces when setting in .env
   - Must be from account with 2FA enabled
   
3. **Test SMTP connection**:
   ```bash
   # Check logs for:
   ✅ Gmail SMTP configured successfully
   ```

4. **Check spam folder**: Confirmation emails might be filtered

5. **Verify admin emails**: Check `ADMIN_EMAILS` is correct

### "Too Many Requests" Error

**Problem**: User receives 429 status after 5 submissions

**This is expected**: Rate limiting is working!

**Solutions**:
- Wait 24 hours for reset
- Use different email address
- For testing, restart server (clears in-memory cache)

### Gmail "Less Secure Apps" Error

**Problem**: Gmail blocks login attempts

**Solution**: You MUST use App Password, not regular password!
1. Enable 2-Step Verification
2. Generate App Password (see setup section)
3. Never use your regular Gmail password

### Emails in Wrong Language

**Problem**: Emails are in Italian but user is English

**Current behavior**: Emails are hardcoded in Italian

**Solution**: Update email templates in `src/lib/email/contact-notifications.ts`

### Rate Limiter Not Working

**Problem**: Can send unlimited messages

**Solutions**:
1. Server restarts clear rate limit cache (expected)
2. Check logs for: `📊 Rate limit: email@example.com - X/5 used`
3. Verify different emails bypass limit (expected)

### Build Errors

**Problem**: TypeScript/ESLint errors after implementation

**Solutions**:
1. Check nodemailer types installed: `@types/nodemailer`
2. Clear `.next` folder: `rm -rf .next && npm run build`
3. Verify all imports are correct

---

## API Endpoint

The contact form uses the following API endpoint:

```
POST /api/contact
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Need help with...",
  "category": "support",
  "message": "Detailed message here...",
  "isAuthenticated": false
}
```

**Response** (Success - Emails Sent):
```json
{
  "success": true,
  "message": "Your message has been sent successfully. We will respond within 2 business days.",
  "data": {
    "emailSent": true,
    "remaining": 4,
    "resetAt": "2025-11-15T10:00:00Z"
  }
}
```

**Response** (Rate Limit Exceeded):
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 43200,
  "resetAt": "2025-11-15T10:00:00Z"
}
```

**Response** (Validation Error):
```json
{
  "error": "Invalid input data",
  "details": [
    {
      "code": "too_small",
      "message": "Message must be at least 10 characters",
      "path": ["message"]
    }
  ]
}
```

**Response** (Error):
```json
{
  "error": "An unexpected error occurred"
}
```

---

## Component Architecture

The contact form follows the Single Responsibility Principle (SRP):

```
src/components/contact/
├── ui/
│   ├── contact-form-field.tsx        # Reusable text input field
│   ├── contact-form-select.tsx       # Reusable select dropdown
│   └── contact-form-textarea.tsx     # Reusable textarea field
└── contact-form.tsx                  # Main form component (orchestration)

src/hooks/
└── use-contact-form.ts               # Form logic and state management

src/lib/schemas/
└── contact.ts                        # Zod validation schemas

src/lib/email/
├── email-service.ts                  # Core SMTP with nodemailer
├── contact-notifications.ts          # Email templates & sending
└── contact-rate-limiter.ts          # In-memory rate limiting

src/app/api/contact/
└── route.ts                          # API route handler (email-first)
```

---

## How It Works

```
┌────────────────────────────────────────────────┐
│  User submits contact form                    │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  1. Validate with Zod                         │
│  2. Check rate limit (5/day per email)        │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  Send emails via Gmail SMTP:                  │
│  - Admin notification (reply button)          │
│  - User confirmation (branded)                │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  Log metadata (console only):                 │
│  - Email address, category, timestamp         │
│  - Email sent status                          │
│  - Rate limit counter                         │
└────────────────────────────────────────────────┘
```

**Key Points**:
- ✅ No database writes
- ✅ Emails are primary storage
- ✅ Rate limiting in memory (resets on restart)
- ✅ Graceful degradation if Gmail not configured

---

## Future Improvements

- [ ] Multi-language email templates (currently Italian only)
- [ ] CAPTCHA for guest submissions
- [ ] File attachment support
- [ ] Admin dashboard to view Gmail inbox
- [ ] Integration with help desk systems (Zendesk, Intercom)
- [ ] Automated responses based on category
- [ ] Email templates customization UI
- [ ] Analytics dashboard (email open rates, response times)
- [ ] Persistent rate limiting (Redis/Upstash)

---

## Gmail Limits & Alternatives

### Gmail Free Tier Limits

- **500 emails/day**: More than sufficient for most use cases
- **Per-account limit**: Resets every 24 hours
- **Recipients**: Can send to multiple admins

### When to Consider Alternatives

If you exceed 500 emails/day, consider:

1. **SendGrid**: $15/month for 50k emails
2. **AWS SES**: $0.10 per 1000 emails
3. **Mailgun**: $35/month for 50k emails
4. **Postmark**: $15/month for 10k emails

**Migration**: Easy! Just swap `email-service.ts` transporter

---

## Support

For issues or questions about the contact form setup, please:
1. Check this documentation
2. Review the code in `src/lib/email/`
3. Check Nodemailer docs at [nodemailer.com](https://nodemailer.com)
4. Review Gmail SMTP settings
5. Open an issue on GitHub

---

**Last Updated**: November 2025

