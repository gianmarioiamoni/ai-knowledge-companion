# Contact Form Setup Guide

This document explains how to configure the contact form feature of AI Knowledge Companion.

## Overview

The contact form allows both authenticated and unauthenticated users to send inquiries, report issues, or request support. It automatically sends:
- **Notification email to administrators**: Contains all submission details
- **Confirmation email to the user**: Acknowledges receipt and provides expected response time

---

## Features

- ✅ Accessible to both authenticated and unauthenticated users
- ✅ Auto-fills email for authenticated users
- ✅ Multiple inquiry categories (General, Support, Bug, Feature Request, Billing, Other)
- ✅ Email notifications to administrators
- ✅ Automatic confirmation emails to users
- ✅ Fully responsive design
- ✅ Multilingual support (English & Italian)
- ✅ Form validation with Zod
- ✅ SRP-compliant component architecture

---

## Required Environment Variables

Add the following environment variables to your `.env.local` file (for development) and to your Vercel Environment Variables (for production):

```env
# Resend API Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Optional: Public contact email (displayed on contact page)
NEXT_PUBLIC_CONTACT_EMAIL=contact@yourdomain.com
```

### Variable Descriptions

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Your Resend API key for sending emails | ✅ Yes | `re_xxxxxxxx` |
| `RESEND_FROM_EMAIL` | Email address that will appear as the sender | ✅ Yes | `noreply@yourdomain.com` |
| `ADMIN_EMAIL` | Email address where contact form submissions will be sent | ✅ Yes | `admin@yourdomain.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact email displayed on the contact page | ❌ No | `contact@yourdomain.com` |

---

## Setting Up Resend

1. **Create a Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account

2. **Verify Your Domain** (Recommended for Production)
   - Navigate to **Domains** in the Resend dashboard
   - Add your domain
   - Add the required DNS records (SPF, DKIM, etc.)
   - Wait for verification (usually takes a few minutes)

3. **Get Your API Key**
   - Navigate to **API Keys** in the Resend dashboard
   - Create a new API key
   - Copy the key and add it to your environment variables

4. **Configure Sender Email**
   - Use a verified domain email for `RESEND_FROM_EMAIL`
   - Example: `noreply@yourdomain.com`
   - For testing, you can use `onboarding@resend.dev` (default)

---

## Testing the Contact Form

### Local Testing

1. **Set up environment variables**:
   ```bash
   # Add to .env.local
   RESEND_API_KEY=your_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ADMIN_EMAIL=your-email@example.com
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Navigate to the contact page**:
   - Authenticated: `http://localhost:3000/en/contact`
   - Unauthenticated: Log out and visit the same URL

4. **Test scenarios**:
   - ✅ Submit as authenticated user (email auto-filled)
   - ✅ Submit as guest user (email required)
   - ✅ Test form validation (empty fields, invalid email)
   - ✅ Check admin receives notification email
   - ✅ Check user receives confirmation email

### Production Testing

1. **Add environment variables to Vercel**:
   - Go to **Project Settings** → **Environment Variables**
   - Add all required variables
   - Redeploy the application

2. **Test on production**:
   - Visit `https://yourdomain.com/en/contact`
   - Submit a test inquiry
   - Verify emails are received

---

## Troubleshooting

### Email Not Sent

**Problem**: Contact form submission succeeds but no emails are received

**Solutions**:
1. Check API key is correct
2. Verify domain is verified in Resend (for custom domains)
3. Check spam/junk folder
4. Review Resend dashboard logs for delivery status
5. Check server logs for errors

### Build Errors

**Problem**: `Missing API key` error during build

**Solution**: This should be fixed with lazy initialization. If the issue persists:
1. Ensure environment variables are set correctly
2. Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Rate Limiting

**Problem**: Too many contact form submissions

**Solution**: The contact form currently doesn't have rate limiting. To add it:
1. Wrap the API route with `withRateLimit` middleware
2. Configure appropriate limits for contact form submissions

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

**Response** (Success):
```json
{
  "success": true,
  "message": "Your message has been sent successfully..."
}
```

**Response** (Error):
```json
{
  "error": "Error message here"
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
└── resend.ts                         # Email sending utilities

src/app/api/contact/
└── route.ts                          # API route handler
```

---

## Future Improvements

- [ ] Add rate limiting to prevent spam
- [ ] Add CAPTCHA for guest submissions
- [ ] Add file attachment support
- [ ] Add admin dashboard to manage inquiries
- [ ] Add email templates system
- [ ] Add automated responses based on category
- [ ] Track response status and SLA

---

## Support

For issues or questions about the contact form setup, please:
1. Check this documentation
2. Review the code in `src/components/contact/`
3. Check Resend documentation at [resend.com/docs](https://resend.com/docs)
4. Open an issue on GitHub

---

**Last Updated**: November 2025

