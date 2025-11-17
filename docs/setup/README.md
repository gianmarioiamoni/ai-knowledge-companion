# 🛠️ Setup Documentation

Setup and deployment guides for AI Knowledge Companion.

## Documents

### Initial Setup
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Complete Supabase setup guide
  - Database schema
  - RLS policies
  - Storage buckets
  - Authentication configuration
  - SQL migrations

### Deployment
- **[VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md)** - Deploy to Vercel step-by-step
  - Environment variables configuration
  - Build settings
  - Domain configuration
  - Continuous deployment
  
- **[VERCEL_TROUBLESHOOTING.md](VERCEL_TROUBLESHOOTING.md)** - Common Vercel deployment issues and solutions

### External Services
- **[STRIPE_WEBHOOK_SETUP.md](STRIPE_WEBHOOK_SETUP.md)** - Configure Stripe webhooks for subscription handling
  - Webhook endpoint creation
  - Event handling
  - Secret key configuration
  - Testing webhooks

- **[UPSTASH_REDIS_SETUP.md](UPSTASH_REDIS_SETUP.md)** - Setup Upstash Redis for rate limiting
  - Create Redis instance
  - Configuration
  - Testing connection

- **[AUTHORIZATION_SETUP.md](AUTHORIZATION_SETUP.md)** - Role-based authorization setup
  - User roles configuration
  - Admin creation
  - Permission management

### Storage Configuration
- **[CREATE_IMAGES_BUCKET_MANUAL.md](CREATE_IMAGES_BUCKET_MANUAL.md)** - Create and configure Supabase storage bucket for images
  - Bucket creation
  - CORS configuration
  - RLS policies
  - Public access settings

### Background Workers
- **[WORKER_SETUP.md](WORKER_SETUP.md)** - Setup background workers for document processing
  - Worker configuration
  - Queue management
  - Cron jobs (if applicable)

## Setup Order

For a new deployment, follow this order:

1. **Supabase Setup** (`SUPABASE_SETUP.md`)
   - Create project
   - Run SQL migrations
   - Configure storage buckets
   - Set up authentication

2. **External Services**
   - Upstash Redis (`UPSTASH_REDIS_SETUP.md`)
   - Stripe (`STRIPE_WEBHOOK_SETUP.md`)

3. **Authorization** (`AUTHORIZATION_SETUP.md`)
   - Create super admin
   - Configure roles

4. **Deployment** (`VERCEL_DEPLOY_GUIDE.md`)
   - Configure environment variables
   - Deploy to Vercel
   - Verify deployment

5. **Workers** (`WORKER_SETUP.md`)
   - Configure background processing

6. **Storage** (`CREATE_IMAGES_BUCKET_MANUAL.md`)
   - Additional bucket configuration if needed

## Environment Variables

Required environment variables (see `.env.example`):

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### OpenAI
```env
OPENAI_API_KEY=
```

### Stripe
```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Upstash Redis
```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Email (Nodemailer)
```env
GMAIL_USER=
GMAIL_APP_PASSWORD=
ADMIN_EMAILS=
NEXT_PUBLIC_CONTACT_EMAIL=
```

### App Configuration
```env
NEXT_PUBLIC_APP_URL=
BOOTSTRAP_SECRET=
```

## Related Documentation

- **User Manual**: See [../user/](../user/)
- **Admin**: See [../admin/](../admin/) for admin setup
- **Development**: See [../development/](../development/)
- **Security**: See [../security/](../security/)

