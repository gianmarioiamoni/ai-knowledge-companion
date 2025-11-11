# 🚀 Deployment Quick Reference

## 📝 Pre-Deploy Checklist

```bash
# 1. Generate secrets
./scripts/generate-secrets.sh

# 2. Verify build works
npm run build

# 3. Check for linting errors
npm run lint

# 4. Run type check
npx tsc --noEmit

# 5. Push to GitHub
git push origin main
```

---

## 🔐 Generated Secrets for this Deployment

**⚠️ SAVE THESE IMMEDIATELY! They are needed for Vercel setup:**

### NEXTAUTH_SECRET
```
sez1nplIWzwfcYxdHx8Me7FX8mArEZ/tDOBBMRt8FYA=
```

### BOOTSTRAP_SECRET
```
2Lxa5VqXJBE7C7ZlJCL7loXhkiaK86JiDJ+kJ6FKtvE=
```

> 💡 **Note**: If you need new secrets, run `./scripts/generate-secrets.sh` again

---

## 🌐 Vercel Setup URLs

1. **New Project**: https://vercel.com/new
2. **Dashboard**: https://vercel.com/dashboard
3. **Import Git Repository** → Select `ai-knowledge-companion`
4. **Framework**: Next.js (auto-detected)
5. **Branch**: `main`

---

## 🔧 Environment Variables (18 total)

### Required for First Deploy

```bash
# Supabase (3)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (1)
OPENAI_API_KEY=

# NextAuth (2) - Use generated secrets above
NEXTAUTH_SECRET=sez1nplIWzwfcYxdHx8Me7FX8mArEZ/tDOBBMRt8FYA=
NEXTAUTH_URL=https://your-url.vercel.app  # Update after first deploy!

# Site (1)
NEXT_PUBLIC_SITE_URL=https://your-url.vercel.app  # Update after first deploy!

# Bootstrap (1) - Use generated secret above
BOOTSTRAP_SECRET=2Lxa5VqXJBE7C7ZlJCL7loXhkiaK86JiDJ+kJ6FKtvE=

# Stripe (7)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
STRIPE_PRICE_ENTERPRISE_MONTHLY=
STRIPE_PRICE_ENTERPRISE_YEARLY=

# Upstash Redis (2)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional (1)
NODE_ENV=production
```

---

## 🔄 Post-Deploy Steps

### 1. Update URLs (IMPORTANT!)
After first deploy, get your Vercel URL and update:
```bash
# Vercel Dashboard → Settings → Environment Variables
NEXTAUTH_URL=https://ai-knowledge-companion-xxx.vercel.app
NEXT_PUBLIC_SITE_URL=https://ai-knowledge-companion-xxx.vercel.app

# Then redeploy!
```

### 2. Configure Supabase
```
Supabase Dashboard → Authentication → URL Configuration

Site URL: https://your-vercel-url.vercel.app

Redirect URLs:
- https://your-vercel-url.vercel.app/**
- https://your-vercel-url.vercel.app/auth/callback
- https://your-vercel-url.vercel.app/api/auth/callback
```

### 3. Configure Stripe Webhook
```
Stripe Dashboard → Developers → Webhooks

Endpoint URL: https://your-vercel-url.vercel.app/api/webhooks/stripe

Events:
✓ customer.subscription.created
✓ customer.subscription.updated
✓ customer.subscription.deleted
✓ checkout.session.completed
✓ invoice.payment_succeeded
✓ invoice.payment_failed
```

### 4. Bootstrap Super Admin
```bash
curl -X POST https://your-vercel-url.vercel.app/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Secret: 2Lxa5VqXJBE7C7ZlJCL7loXhkiaK86JiDJ+kJ6FKtvE=" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "YourSecurePassword123!"
  }'
```

---

## ✅ Quick Test Checklist

```bash
# 1. Test auth
open https://your-url.vercel.app/auth/login

# 2. Test rate limiting
for i in {1..15}; do curl -X POST https://your-url.vercel.app/api/test; done

# 3. Test subscription
open https://your-url.vercel.app/plans

# 4. Test upload
open https://your-url.vercel.app/documents

# 5. Test chat
open https://your-url.vercel.app/tutors
```

---

## 🔄 Continuous Deployment Workflow

### Development
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Work and commit
git add .
git commit -m "feat: my new feature"
git push origin feature/my-feature

# 3. Vercel creates preview deployment automatically!
```

### Production Deploy
```bash
# Merge to main when ready
git checkout main
git merge feature/my-feature
git push origin main  # ← Auto-deploys to production!
```

### Hotfix
```bash
# For urgent fixes
git checkout -b hotfix/critical-fix
# ... fix and test ...
git checkout main
git merge hotfix/critical-fix
git push origin main  # ← Immediate deploy
```

---

## 📊 Monitoring & Logs

### Vercel
- **Deployments**: https://vercel.com/dashboard
- **Logs**: Dashboard → Logs tab
- **Analytics**: Dashboard → Analytics tab

### Supabase
- **Database**: https://supabase.com/dashboard
- **Logs**: Dashboard → Logs
- **Auth**: Dashboard → Authentication

### Stripe
- **Payments**: https://dashboard.stripe.com/payments
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Webhooks**: https://dashboard.stripe.com/webhooks

### Upstash Redis
- **Console**: https://console.upstash.com
- **Metrics**: Database → Metrics

---

## 🚨 Common Issues & Fixes

### "NEXTAUTH_URL is required"
```bash
# Add to Vercel env vars and redeploy
NEXTAUTH_URL=https://your-url.vercel.app
```

### "Supabase connection failed"
```bash
# 1. Check Supabase keys are correct
# 2. Add Vercel URL to Supabase whitelist
# 3. Verify RLS policies are enabled
```

### "Stripe webhook failed"
```bash
# 1. Verify STRIPE_WEBHOOK_SECRET is correct
# 2. Test webhook from Stripe Dashboard
# 3. Check Vercel function logs for errors
```

### "Rate limiting not working"
```bash
# 1. Verify Upstash Redis credentials
# 2. Check Vercel logs for Redis errors
# 3. Ensure UPSTASH_REDIS_REST_URL and TOKEN are set
```

### Build fails
```bash
# 1. Test build locally first
npm run build

# 2. Check TypeScript errors
npx tsc --noEmit

# 3. Check linting
npm run lint

# 4. Verify all dependencies are in package.json
```

---

## 📚 Full Documentation

For complete step-by-step guide, see:
**`docs/setup/VERCEL_DEPLOY_GUIDE.md`**

For deployment checklist, see:
**`.vercel-deploy-checklist.md`**

---

## 🎯 Current Deployment Status

- [x] Code pushed to GitHub main branch
- [x] Secrets generated (see above)
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] First deploy completed
- [ ] URLs updated
- [ ] Supabase configured
- [ ] Stripe configured
- [ ] Super admin created
- [ ] Tests passed

**Next Step**: Go to https://vercel.com/new and import the repository!

---

## 🆘 Need Help?

1. Check Vercel logs: https://vercel.com/dashboard
2. Check deployment guide: `docs/setup/VERCEL_DEPLOY_GUIDE.md`
3. Check deployment checklist: `.vercel-deploy-checklist.md`
4. Review this quick reference

**Good luck with your deployment! 🚀**

