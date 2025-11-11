# 🚨 Vercel Deployment Troubleshooting

Common issues and solutions for deploying AI Knowledge Companion to Vercel.

---

## ❌ Error: `ERESOLVE unable to resolve dependency tree`

### Problem
```
npm error ERESOLVE unable to resolve dependency tree
npm error While resolving: ai-knowledge-companion@0.1.0
npm error Found: dotenv@17.2.3
npm error Could not resolve dependency:
npm error peer dotenv@"^16.4.5" from @browserbasehq/stagehand@1.14.0
```

### Root Cause
Vercel is using `npm` by default, but this project is built with `pnpm`. The dependency resolution algorithms differ between package managers, causing conflicts.

### Solution ✅
The project is already configured to use `pnpm`:

1. **`package.json`** includes:
   ```json
   "packageManager": "pnpm@9.15.0"
   ```

2. **`vercel.json`** specifies:
   ```json
   "installCommand": "pnpm install",
   "buildCommand": "pnpm run build"
   ```

**Action**: Simply **redeploy** on Vercel. It will now use `pnpm` automatically.

---

## ❌ Error: `NEXTAUTH_URL is required`

### Problem
```
Error: NEXTAUTH_URL is required in production
```

### Root Cause
Missing or incorrect `NEXTAUTH_URL` environment variable.

### Solution ✅
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   ```
   NEXTAUTH_URL=https://your-actual-vercel-url.vercel.app
   NEXT_PUBLIC_SITE_URL=https://your-actual-vercel-url.vercel.app
   ```
3. **Redeploy**

---

## ❌ Error: `Supabase connection failed`

### Problem
```
Error: Failed to connect to Supabase
Error: Invalid API key
```

### Root Cause
- Missing Supabase credentials
- Incorrect environment variables
- Vercel URL not whitelisted in Supabase

### Solution ✅

#### 1. Verify Environment Variables
Vercel Dashboard → Settings → Environment Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### 2. Whitelist Vercel URL in Supabase
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   ```
   https://your-vercel-url.vercel.app/**
   https://your-vercel-url.vercel.app/auth/callback
   ```

#### 3. Verify RLS Policies
Ensure Row Level Security is enabled on all tables.

---

## ❌ Error: `Stripe webhook signature verification failed`

### Problem
```
Error: Invalid webhook signature
```

### Root Cause
- Webhook secret mismatch
- Webhook not configured for production URL

### Solution ✅

#### 1. Create Production Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. Set URL: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

#### 2. Update Webhook Secret
1. Copy the **Signing secret** from Stripe
2. Update Vercel env var:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. **Redeploy**

#### 3. Test Webhook
From Stripe Dashboard → Webhooks → Your endpoint → Send test webhook

---

## ❌ Error: `Rate limiting not working`

### Problem
Rate limiting returns errors or doesn't apply limits.

### Root Cause
- Upstash Redis not configured
- Missing environment variables

### Solution ✅

#### 1. Verify Upstash Redis Credentials
Vercel Dashboard → Settings → Environment Variables:
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AabBcCd...
```

#### 2. Test Redis Connection
```bash
curl https://your-vercel-url.vercel.app/api/health
```

Should return 200 OK if Redis is working.

---

## ❌ Error: `Build timeout`

### Problem
```
Error: Build exceeded maximum duration of 45 minutes
```

### Root Cause
- Large dependencies taking too long to install
- Complex build process

### Solution ✅

#### 1. Optimize Dependencies (Already Done)
The project uses `pnpm` which is faster than `npm`.

#### 2. Enable Caching
Vercel automatically caches `node_modules` with `pnpm`.

#### 3. Upgrade Vercel Plan (if needed)
Free tier has build limits. Pro tier has higher limits.

---

## ❌ Error: `Function execution timeout`

### Problem
```
Error: Task timed out after 10.00 seconds
```

### Root Cause
API routes are taking too long (e.g., AI processing, document parsing).

### Solution ✅
Already configured in `vercel.json`:
```json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 60
  }
}
```

This allows API routes to run up to 60 seconds (Pro plan required for >10s).

---

## ❌ Error: `Image optimization failed`

### Problem
```
Error: Failed to optimize image
```

### Root Cause
- Invalid image URL
- Image too large
- External domain not configured

### Solution ✅
Already configured in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
  qualities: [75, 80, 90, 95, 100],
}
```

For additional domains, add to `remotePatterns`.

---

## ❌ Error: `Module not found` during build

### Problem
```
Error: Cannot find module '@/components/...'
```

### Root Cause
- Path alias not configured
- Missing dependency

### Solution ✅

#### 1. Verify `tsconfig.json` (Already Configured)
```json
"paths": {
  "@/*": ["./src/*"]
}
```

#### 2. Clear Vercel Cache
Vercel Dashboard → Deployments → ... → Redeploy → Clear cache and redeploy

---

## ❌ Error: `Environment variable not defined`

### Problem
```
Error: process.env.SOME_VAR is undefined
```

### Root Cause
- Variable not added to Vercel
- Variable only set for specific environment (preview/production)

### Solution ✅

#### 1. Add Variable to All Environments
Vercel Dashboard → Settings → Environment Variables:
- Check **Production**, **Preview**, and **Development**

#### 2. Use `NEXT_PUBLIC_` prefix for Client-Side Variables
Only variables starting with `NEXT_PUBLIC_` are available in the browser:
```bash
NEXT_PUBLIC_SITE_URL=https://...  # ✅ Available client-side
API_SECRET=secret123              # ✅ Server-side only
```

---

## ❌ Error: `OpenAI API rate limit exceeded`

### Problem
```
Error: Rate limit exceeded for API key
```

### Root Cause
- Too many API calls
- Insufficient OpenAI quota

### Solution ✅

#### 1. Verify OpenAI API Key
- Check you're using the correct key (production, not test)
- Verify billing is set up on OpenAI

#### 2. Rate Limiting (Already Implemented)
The app has rate limiting for AI endpoints:
- Free users: 5 requests/minute
- Paid users: 50 requests/minute
- Admins: 200 requests/minute

#### 3. Increase OpenAI Quota
OpenAI Dashboard → Settings → Billing → Increase limits

---

## 🔧 General Debugging Steps

### 1. Check Build Logs
Vercel Dashboard → Deployments → Latest → Build Logs

Look for:
- ❌ Red error messages
- ⚠️ Yellow warnings
- Missing environment variables

### 2. Check Function Logs
Vercel Dashboard → Deployments → Latest → Functions

Filter by:
- Errors only
- Specific API route
- Time range

### 3. Test Locally First
```bash
# Build production locally
pnpm run build

# Run production server
pnpm run start

# Test the build
curl http://localhost:3000/api/health
```

If it works locally but fails on Vercel, it's likely an environment variable issue.

### 4. Enable Verbose Logging (Temporarily)
Add to Vercel environment variables:
```bash
DEBUG=*
NODE_ENV=development  # For more detailed errors
```

**⚠️ Remove after debugging!**

### 5. Compare Working vs Failing Deployment
Vercel Dashboard → Deployments:
- Compare environment variables
- Compare build logs
- Check if any dependency versions changed

---

## 📚 Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Status**: https://vercel-status.com
- **Vercel Support**: https://vercel.com/support
- **Project Deployment Guide**: [`VERCEL_DEPLOY_GUIDE.md`](./VERCEL_DEPLOY_GUIDE.md)
- **Quick Reference**: [`DEPLOYMENT_QUICK_REF.md`](../../DEPLOYMENT_QUICK_REF.md)

---

## 🆘 Still Having Issues?

1. Check Vercel logs thoroughly
2. Search Vercel community: https://github.com/vercel/vercel/discussions
3. Check this project's documentation in `/docs`
4. Verify all 18 environment variables are set correctly

**Most common issue**: Missing or incorrect environment variables. Double-check them! ✅

