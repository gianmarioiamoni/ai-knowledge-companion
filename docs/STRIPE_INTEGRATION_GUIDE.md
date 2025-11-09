# Stripe Payment Integration Guide

Complete guide to integrate Stripe payments with PayPal and Credit Card support.

---

## 📋 TABLE OF CONTENTS

1. [Stripe Account Setup](#1-stripe-account-setup)
2. [Create Products & Prices](#2-create-products--prices)
3. [Environment Variables](#3-environment-variables)
4. [Database Schema](#4-database-schema)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Webhook Configuration](#7-webhook-configuration)
8. [Testing](#8-testing)
9. [Production Checklist](#9-production-checklist)

---

## 1. STRIPE ACCOUNT SETUP

### 1.1 Create Account

1. Go to https://stripe.com
2. Click "Sign up" or "Start now"
3. Complete registration with:
   - Email
   - Password
   - Business name: `AI Knowledge Companion`
   - Country

### 1.2 Verify Account

1. Verify email address
2. Complete business information
3. Add bank account details (for payouts)

### 1.3 Enable Payment Methods

**Dashboard → Settings → Payment methods**

- ✅ **Cards** (already enabled by default)
  - Visa
  - Mastercard
  - American Express
  - Discover
  - Diners Club
  - JCB

- ✅ **PayPal** (requires additional setup)
  1. Click on "PayPal" in payment methods list
  2. Click "Enable"
  3. You'll need a PayPal Business account
  4. Follow Stripe's instructions to connect PayPal
  5. Note: PayPal may take 1-2 business days to activate

### 1.4 Get API Keys

**Dashboard → Developers → API keys**

You'll see two types of keys:

**Test Mode** (for development):
- Publishable key: `pk_test_xxxxxxxxxxxxx`
- Secret key: `sk_test_xxxxxxxxxxxxx`

**Live Mode** (for production):
- Publishable key: `pk_live_xxxxxxxxxxxxx`
- Secret key: `sk_live_xxxxxxxxxxxxx`

⚠️ **IMPORTANT**: Never share or commit your secret keys!

---

## 2. CREATE PRODUCTS & PRICES

### 2.1 Navigate to Products

**Dashboard → Products → Add product**

### 2.2 Create Pro Plan

**Product Information:**
- Name: `AI Knowledge Companion - Pro`
- Description: `Perfect for individuals and small teams`
- Statement descriptor: `AI Companion Pro` (appears on credit card statements)

**Pricing - Monthly:**
- Price: `$19.00`
- Billing period: `Monthly`
- Payment type: `Recurring`
- Price description: `Pro Plan - Monthly`

After creating, note the **Price ID**: `price_xxxxxxxxxxxxx`

**Pricing - Yearly:**
- Click "Add another price" on the same product
- Price: `$190.00`
- Billing period: `Yearly`
- Payment type: `Recurring`
- Price description: `Pro Plan - Yearly (Save $38/year)`

Note the **Price ID**: `price_yyyyyyyyyyyyy`

### 2.3 Create Enterprise Plan

**Product Information:**
- Name: `AI Knowledge Companion - Enterprise`
- Description: `For power users and organizations`
- Statement descriptor: `AI Companion Ent`

**Pricing - Monthly:**
- Price: `$49.00`
- Billing period: `Monthly`
- Payment type: `Recurring`
- Price description: `Enterprise Plan - Monthly`

Note the **Price ID**: `price_zzzzzzzzzzzzz`

**Pricing - Yearly:**
- Click "Add another price"
- Price: `$490.00`
- Billing period: `Yearly`
- Payment type: `Recurring`
- Price description: `Enterprise Plan - Yearly (Save $98/year)`

Note the **Price ID**: `price_wwwwwwwwwwwww`

### 2.4 Summary Table

| Plan       | Billing | Price   | Stripe Price ID         |
|------------|---------|---------|-------------------------|
| Pro        | Monthly | $19.00  | `price_xxxxxxxxxxxxx`   |
| Pro        | Yearly  | $190.00 | `price_yyyyyyyyyyyyy`   |
| Enterprise | Monthly | $49.00  | `price_zzzzzzzzzzzzz`   |
| Enterprise | Yearly  | $490.00 | `price_wwwwwwwwwwwwww`  |

---

## 3. ENVIRONMENT VARIABLES

### 3.1 Update `.env.local`

Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
STRIPE_SECRET_KEY=sk_test_your_actual_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_yyyyyyyyyyyyy
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_zzzzzzzzzzzzz
STRIPE_PRICE_ENTERPRISE_YEARLY=price_wwwwwwwwwwwww
```

Replace with your actual values from Stripe Dashboard.

### 3.2 Verify Loading

Restart your development server after adding environment variables:

```bash
npm run dev
```

---

## 4. DATABASE SCHEMA

### 4.1 Add Stripe Customer ID to Profiles

We need to store Stripe customer IDs for each user.

Run this SQL in Supabase:

```sql
-- Add stripe_customer_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);
```

### 4.2 Add Stripe Subscription ID to User Subscriptions

```sql
-- Add stripe_subscription_id and stripe_price_id to user_subscriptions
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id 
ON user_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_price_id 
ON user_subscriptions(stripe_price_id);
```

### 4.3 Map Stripe Price IDs to Plans

```sql
-- Add stripe_monthly_price_id and stripe_yearly_price_id to subscription_plans
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS stripe_monthly_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_yearly_price_id VARCHAR(255);

-- Update plans with Stripe Price IDs (replace with your actual IDs)
UPDATE subscription_plans
SET 
  stripe_monthly_price_id = 'price_xxxxxxxxxxxxx',
  stripe_yearly_price_id = 'price_yyyyyyyyyyyyy'
WHERE name = 'pro';

UPDATE subscription_plans
SET 
  stripe_monthly_price_id = 'price_zzzzzzzzzzzzz',
  stripe_yearly_price_id = 'price_wwwwwwwwwwwww'
WHERE name = 'enterprise';
```

---

## 5. BACKEND IMPLEMENTATION

### 5.1 Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

### 5.2 File Structure

```
src/
├── lib/
│   └── stripe/
│       ├── client.ts          # Stripe client initialization
│       ├── checkout.ts        # Checkout session creation
│       ├── customer.ts        # Customer management
│       ├── subscription.ts    # Subscription management
│       └── webhook.ts         # Webhook event handling
├── app/
│   └── api/
│       ├── stripe/
│       │   ├── create-checkout-session/
│       │   │   └── route.ts
│       │   ├── create-portal-session/
│       │   │   └── route.ts
│       │   └── customer/
│       │       └── route.ts
│       └── webhooks/
│           └── stripe/
│               └── route.ts
```

---

## 6. FRONTEND IMPLEMENTATION

### 6.1 Stripe Elements Integration

- Add Stripe.js to Plans page
- Create checkout button component
- Handle redirects and errors
- Show loading states

### 6.2 Customer Portal

- Add "Manage Subscription" button
- Redirect to Stripe Customer Portal
- Allow users to:
  - Update payment method
  - Cancel subscription
  - View invoices

---

## 7. WEBHOOK CONFIGURATION

### 7.1 Create Webhook Endpoint in Stripe

**Dashboard → Developers → Webhooks → Add endpoint**

**Endpoint URL:**
- Development: Use Stripe CLI for local testing
- Production: `https://your-domain.com/api/webhooks/stripe`

**Events to listen to:**
- `checkout.session.completed` - Payment successful, create subscription
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Plan changed or payment method updated
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.paid` - Recurring payment successful
- `invoice.payment_failed` - Payment failed

### 7.2 Local Webhook Testing with Stripe CLI

**Install Stripe CLI:**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

**Login and Forward Webhooks:**

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret like `whsec_xxxxxxxxxxxxx`. Use this in your `.env.local` for `STRIPE_WEBHOOK_SECRET`.

---

## 8. TESTING

### 8.1 Test Credit Card Numbers

Stripe provides test card numbers:

**Success:**
- `4242 4242 4242 4242` - Visa (always succeeds)
- `5555 5555 5555 4444` - Mastercard (always succeeds)

**Error Cases:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

**Use any:**
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

### 8.2 Test PayPal

In test mode, you can use Stripe's test PayPal account or create a test PayPal account.

### 8.3 Test Scenarios

1. **New subscription (monthly)**
   - Select Pro plan, monthly
   - Click "Subscribe"
   - Complete Stripe checkout
   - Verify subscription created in database

2. **New subscription (yearly)**
   - Select Enterprise plan, yearly
   - Complete checkout
   - Verify correct price applied

3. **Upgrade plan**
   - User on Pro monthly
   - Upgrade to Enterprise monthly
   - Verify proration

4. **Cancel subscription**
   - Cancel from Customer Portal
   - Verify access until period end

5. **Failed payment**
   - Use test card for decline
   - Verify subscription status updated

---

## 9. PRODUCTION CHECKLIST

### 9.1 Before Going Live

- [ ] Complete Stripe account activation
- [ ] Verify business information
- [ ] Add bank account for payouts
- [ ] Enable PayPal in production
- [ ] Switch to Live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real (small amount) transactions
- [ ] Set up email notifications for failed payments
- [ ] Configure invoice settings
- [ ] Set up tax collection (if required)

### 9.2 Environment Variables

Update `.env.production` with live keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (from live webhook)
```

### 9.3 Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced for all pages
- [ ] Rate limiting on API routes
- [ ] User authentication required for all payment endpoints
- [ ] Proper error handling (don't expose internal errors to users)

### 9.4 Monitoring

- [ ] Set up Stripe Dashboard alerts
- [ ] Monitor webhook delivery failures
- [ ] Track failed payments
- [ ] Set up email notifications for critical events

---

## 📚 ADDITIONAL RESOURCES

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe Checkout**: https://stripe.com/docs/payments/checkout
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **PayPal on Stripe**: https://stripe.com/docs/payments/paypal
- **Stripe Testing**: https://stripe.com/docs/testing

---

## 🆘 TROUBLESHOOTING

### Common Issues

**1. Webhook not receiving events:**
- Verify webhook URL is correct
- Check webhook signing secret
- Ensure endpoint returns 200 status
- Check Stripe Dashboard for failed deliveries

**2. PayPal not available at checkout:**
- Verify PayPal is enabled in Stripe Dashboard
- Check if customer's location supports PayPal
- Ensure amount is within PayPal limits

**3. Customer already exists error:**
- Check if stripe_customer_id already stored
- Use existing customer ID instead of creating new one

**4. Subscription not created:**
- Check webhook events in Stripe Dashboard
- Verify database triggers are working
- Check application logs for errors

---

## 📞 SUPPORT

If you encounter issues:
1. Check Stripe Dashboard logs
2. Review webhook delivery attempts
3. Check application logs
4. Contact Stripe support: https://support.stripe.com


