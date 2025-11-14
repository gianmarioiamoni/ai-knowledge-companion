# Contact Form Setup Guide

This document explains how to configure the contact form feature of AI Knowledge Companion.

## Overview

The contact form allows both authenticated and unauthenticated users to send inquiries, report issues, or request support. All submissions are:
- **Saved to the database**: Stored in the `contact_messages` table
- **Tracked with status**: Pending, In Progress, Resolved, Closed
- **Accessible to administrators**: Via database or admin dashboard

---

## Features

- ✅ Accessible to both authenticated and unauthenticated users
- ✅ Auto-fills email for authenticated users
- ✅ Multiple inquiry categories (General, Support, Bug, Feature Request, Billing, Other)
- ✅ Messages saved to database with full metadata
- ✅ Status tracking and priority assignment
- ✅ User agent and IP tracking for security
- ✅ Fully responsive design
- ✅ Multilingual support (English & Italian)
- ✅ Form validation with Zod
- ✅ SRP-compliant component architecture

---

## Database Setup

### Apply Migration

Run the migration to create the `contact_messages` table:

```bash
# Connect to your Supabase database and run:
psql $DATABASE_URL -f sql/26_contact_messages.sql
```

Or through the Supabase Dashboard:
1. Go to **SQL Editor**
2. Create a new query
3. Copy the content from `sql/26_contact_messages.sql`
4. Execute the query

### Table Structure

The `contact_messages` table includes:
- **User information**: user_id, name, email
- **Message details**: subject, category, message
- **Status tracking**: status (pending/in_progress/resolved/closed), priority
- **Metadata**: is_authenticated, user_agent, ip_address
- **Response tracking**: responded_at, responded_by, response_notes
- **Timestamps**: created_at, updated_at

### Row Level Security (RLS)

The table has built-in RLS policies:
- ✅ Users can view and insert their own messages
- ✅ Admins can view, update, and delete all messages
- ✅ Guest submissions (user_id = NULL) are allowed

## Optional Environment Variables

Add this to your `.env.local` file (for development) and to your Vercel Environment Variables (for production):

```env
# Optional: Public contact email (displayed on contact page)
NEXT_PUBLIC_CONTACT_EMAIL=contact@yourdomain.com
```

### Variable Descriptions

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact email displayed on the contact page | ❌ No | `contact@yourdomain.com` |

---

## Setup Complete!

No external services required! The contact form uses your existing Supabase database to store all messages.

---

## Testing the Contact Form

### Local Testing

1. **Apply database migration**:
   ```bash
   psql $DATABASE_URL -f sql/26_contact_messages.sql
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
   - ✅ Verify message saved in database
   - ✅ Check metadata (user_agent, ip_address) is captured

5. **Verify database**:
   ```sql
   -- Check all messages
   SELECT * FROM public.contact_messages ORDER BY created_at DESC;
   
   -- Get statistics
   SELECT get_contact_message_stats();
   ```

### Production Testing

1. **Apply migration on production database**:
   - Run the migration through Supabase Dashboard SQL Editor
   - Or use the production database URL

2. **Test on production**:
   - Visit `https://yourdomain.com/en/contact`
   - Submit a test inquiry
   - Verify message appears in database

3. **Admin Dashboard** (Optional):
   - Create an admin interface to view and manage messages
   - Use Supabase RLS policies to restrict access to admins only

---

## Troubleshooting

### Message Not Saved

**Problem**: Contact form submission fails with error

**Solutions**:
1. Verify migration was applied correctly:
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'contact_messages'
   );
   ```
2. Check RLS policies are enabled and correct
3. Verify Supabase service role key is configured
4. Check server logs for detailed error messages

### Permission Denied Errors

**Problem**: RLS policy blocks insertions

**Solutions**:
1. Ensure service client is used for insertions (bypasses RLS)
2. Verify RLS policies allow guest submissions (user_id = NULL)
3. Check `createServiceClient()` is configured correctly

### Missing Metadata

**Problem**: user_agent or ip_address not captured

**Solutions**:
1. Verify headers are being passed correctly in production
2. Check reverse proxy configuration (Vercel, Cloudflare)
3. Ensure `x-forwarded-for` header is available

### Rate Limiting

**Problem**: Too many contact form submissions

**Solution**: The contact form currently doesn't have rate limiting. To add it:
1. Wrap the API route with `withRateLimit` middleware
2. Configure appropriate limits for contact form submissions
3. Add rate limiting based on IP address for guest users

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
  "message": "Your message has been sent successfully. We will respond within 2 business days.",
  "data": {
    "id": "uuid-here",
    "created_at": "2025-11-14T10:00:00Z"
  }
}
```

**Response** (Error):
```json
{
  "error": "Error message here",
  "details": []
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

src/app/api/contact/
└── route.ts                          # API route handler (saves to database)

sql/
└── 26_contact_messages.sql          # Database migration
```

---

## Future Improvements

- [ ] Add rate limiting to prevent spam
- [ ] Add CAPTCHA for guest submissions
- [ ] Add file attachment support
- [ ] **Add admin dashboard to view and manage messages**
- [ ] Add email notifications to admins (via Supabase triggers or Edge Functions)
- [ ] Add automated responses based on category
- [ ] Track response SLA and metrics
- [ ] Add search and filtering for messages
- [ ] Export messages to CSV/PDF

---

## Support

For issues or questions about the contact form setup, please:
1. Check this documentation
2. Review the code in `src/components/contact/`
3. Check Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
4. Review the database migration in `sql/26_contact_messages.sql`
5. Open an issue on GitHub

---

## Admin Dashboard (Optional)

To view and manage contact messages, you can:

### Option 1: Supabase Dashboard
- Navigate to **Table Editor** → `contact_messages`
- View, edit, and delete messages directly
- Use filters and search

### Option 2: Custom Admin Interface
Create an admin page at `src/app/[locale]/admin/contact-messages/page.tsx`:

```typescript
// Example: Basic admin interface
import { createServiceClient } from '@/lib/supabase/service';

export default async function ContactMessagesPage() {
  const supabase = createServiceClient();
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1>Contact Messages</h1>
      {/* Render messages in a table with status/priority filters */}
    </div>
  );
}
```

### Option 3: SQL Queries
Use SQL queries to analyze messages:

```sql
-- Get recent messages
SELECT * FROM contact_messages 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Get statistics
SELECT get_contact_message_stats();

-- Mark as resolved
UPDATE contact_messages 
SET status = 'resolved', 
    responded_at = NOW(),
    responded_by = 'your-admin-user-id'
WHERE id = 'message-id';
```

---

**Last Updated**: November 2025

