# 🚀 Deployment Documentation

Documentation for deploying AI Knowledge Companion to production.

---

## 📋 Stripe Production Setup

### [**Stripe Live Mode Checklist**](./STRIPE_LIVE_MODE_CHECKLIST.md)
**Quick checklist for activating Stripe in production.**

**Use this when:**
- You've already configured products in Stripe test mode
- You need to replicate them in live mode
- You want a step-by-step checklist

**Current Configuration:**
- **Pro Plan**: €19/month, €190/year
- **Enterprise Plan**: €49/month, €490/year

---

### [**🔐 Stripe Restricted Key Setup**](./STRIPE_RESTRICTED_KEY_SETUP.md)
**Security guide for creating restricted API keys (RECOMMENDED).**

**Use this when:**
- Setting up production API keys
- Following security best practices
- Implementing least-privilege principle

**Covers:**
- Why use restricted keys vs standard keys
- Required permissions for AI Knowledge Companion
- Step-by-step key creation
- Permission audit checklist
- Key rotation and monitoring

---

### [Stripe Production Setup Guide](./STRIPE_PRODUCTION_SETUP.md)
**Complete, comprehensive guide for Stripe production activation.**

**Use this when:**
- Setting up Stripe from scratch
- Need detailed explanations for each step
- Want to understand the full process

**Covers:**
- Account verification
- Product creation strategies
- API key management
- Webhook configuration
- Security best practices
- Monitoring and troubleshooting

---

## 🔗 Related Documentation

### Vercel Deployment
- [Vercel Deploy Guide](../setup/VERCEL_DEPLOY_GUIDE.md) - Complete Vercel deployment guide
- [Vercel Troubleshooting](../setup/VERCEL_TROUBLESHOOTING.md) - Common deployment issues

### Stripe Integration
- [Stripe Webhook Setup](../setup/STRIPE_WEBHOOK_SETUP.md) - Webhook configuration guide

### Environment Configuration
- See [README.md](../../README.md#-environment-variables) for all required environment variables

---

## 🚨 Pre-Deployment Checklist

Before activating Stripe live mode:

- [ ] ✅ Vercel deployment is working correctly
- [ ] ✅ All environment variables configured (Supabase, OpenAI)
- [ ] ✅ Database migrations applied
- [ ] ✅ Super admin account created
- [ ] ✅ Google OAuth configured for production domain
- [ ] ✅ Stripe test mode working correctly
- [ ] ✅ `.env.local` does not contain production secrets

---

## 🔐 Security Reminders

⚠️ **CRITICAL**:
- **NEVER** commit Stripe live keys to Git
- Store live keys **ONLY** in Vercel Production environment
- Use test keys for Development/Preview environments
- Rotate keys immediately if exposed
- Enable Stripe email notifications for failed webhooks

---

## 📞 Support

For deployment issues:
1. Check [Vercel Troubleshooting](../setup/VERCEL_TROUBLESHOOTING.md)
2. Review Vercel deployment logs
3. Check Stripe webhook logs
4. Verify environment variables are correctly set

---

**Last Updated**: November 2025

