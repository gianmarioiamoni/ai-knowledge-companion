# 🚀 Stripe Production Mode Setup Guide

Complete guide to activate Stripe in production mode for deployment.

---

## 📋 Prerequisites

- ✅ Stripe account fully verified
- ✅ Business information completed in Stripe Dashboard
- ✅ Bank account connected for payouts
- ✅ Tax information provided (if required)
- ✅ Application deployed to production (Vercel)

---

## 🔄 Step-by-Step Migration Process

### **Step 1: Verify Stripe Account Activation**

1. **Login to Stripe Dashboard**: https://dashboard.stripe.com
2. **Check Account Status**:
   - Top-right corner: Should show your business name
   - Look for banner: "Your account is ready to accept live payments"
   - If not activated:
     - Go to **Settings** → **Account Details**
     - Complete all required information
     - Add bank account: **Settings** → **Bank accounts and scheduling**
     - Verify identity (may require documents)

3. **Required Information**:
   - Business type (individual, company, non-profit)
   - Business address and contact
   - Tax ID (VAT, EIN, etc.)
   - Bank account for payouts
   - Identity verification (passport/ID)

**⚠️ Activation may take 1-3 business days depending on your country.**

---

### **Step 2: Create Production Products & Prices**

Currently you have test products. You need to create identical products in **Production Mode**.

1. **Switch to Live Mode**:
   - Top-left corner: Toggle from "Test mode" to **Live mode**
   - Stripe UI will turn from orange to blue

2. **Create Products** (same as test):
   - Go to **Products** → **Add Product**
   
   **Free Trial Plan**:
   - Name: `Free Trial`
   - Description: `7-day free trial with limited features`
   - Price: `€0.00 / month`
   - Recurring: Monthly
   - ✅ Save Product → **Copy Price ID** (starts with `price_live_...`)

   **Basic Plan**:
   - Name: `Basic Plan`
   - Description: `Essential features for individual users`
   - Price: `€9.99 / month` (or your price)
   - Recurring: Monthly
   - ✅ Save Product → **Copy Price ID**

   **Pro Plan**:
   - Name: `Pro Plan`
   - Description: `Advanced features for power users`
   - Price: `€29.99 / month` (or your price)
   - Recurring: Monthly
   - ✅ Save Product → **Copy Price ID**

   **Enterprise Plan**:
   - Name: `Enterprise Plan`
   - Description: `Full features with priority support`
   - Price: `€99.99 / month` (or your price)
   - Recurring: Monthly
   - ✅ Save Product → **Copy Price ID**

3. **Save Price IDs**:
   ```
   FREE_TRIAL_PRICE_ID=price_live_xxxxxxxxxxxxx
   BASIC_PRICE_ID=price_live_xxxxxxxxxxxxx
   PRO_PRICE_ID=price_live_xxxxxxxxxxxxx
   ENTERPRISE_PRICE_ID=price_live_xxxxxxxxxxxxx
   ```

---

### **Step 3: Get Production API Keys**

1. **Go to Developers** → **API keys** (in Live mode)
2. **Copy Keys**:
   
   **Publishable Key** (starts with `pk_live_`):
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

   **Secret Key** (starts with `sk_live_`):
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **⚠️ IMPORTANT SECURITY**:
   - **NEVER commit** live keys to Git
   - Store **only** in Vercel Environment Variables
   - Rotate keys immediately if exposed

---

### **Step 4: Create Production Webhook**

1. **Go to Developers** → **Webhooks** (in Live mode)
2. **Click**: Add endpoint
3. **Endpoint URL**: 
   ```
   https://ai-knowledge-companion.vercel.app/api/webhooks/stripe
   ```
4. **Select Events** to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.created`
   - ✅ `customer.updated`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

5. **Save** → **Copy Signing Secret** (starts with `whsec_`):
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

---

### **Step 5: Update Vercel Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select Project**: `ai-knowledge-companion`
3. **Settings** → **Environment Variables**
4. **Update/Add** the following variables:

   **Delete old test keys** (if exist):
   - Remove: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test)
   - Remove: `STRIPE_SECRET_KEY` (test)
   - Remove: `STRIPE_WEBHOOK_SECRET` (test)

   **Add new production keys**:
   
   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
   | `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
   | `STRIPE_PRICE_PRO_MONTHLY` | `price_live_...` (Pro €19/month) | Production |
   | `STRIPE_PRICE_PRO_YEARLY` | `price_live_...` (Pro €190/year) | Production |
   | `STRIPE_PRICE_ENTERPRISE_MONTHLY` | `price_live_...` (Enterprise €49/month) | Production |
   | `STRIPE_PRICE_ENTERPRISE_YEARLY` | `price_live_...` (Enterprise €490/year) | Production |

5. **Important**: Select **"Production"** environment for all variables
6. **Save** all variables

---

### **Step 6: Redeploy Application**

1. **Trigger Redeployment**:
   - Go to **Deployments** tab in Vercel
   - Click **"..."** on latest deployment → **Redeploy**
   - Or push a commit to trigger auto-deploy:
     ```bash
     git commit --allow-empty -m "chore: redeploy with production Stripe keys"
     git push
     ```

2. **Wait for Deployment** to complete (~2-3 minutes)

---

### **Step 7: Test Production Payment Flow**

⚠️ **This will create REAL charges! Use small amounts for testing.**

1. **Navigate to Plans Page**:
   ```
   https://ai-knowledge-companion.vercel.app/en/plans
   ```

2. **Verify UI**:
   - ✅ No "Test Mode" banner visible
   - ✅ Plans are displayed correctly
   - ✅ Prices match your production prices

3. **Test Checkout** (use a real card, will be charged!):
   - Click on a plan (suggest Basic €9.99)
   - You'll be redirected to Stripe Checkout
   - **Verify**: Checkout page is in **Live Mode** (blue, not orange)
   - **Use Test Card** (Stripe won't charge test cards in live mode, they'll fail):
     - Card: `4242 4242 4242 4242`
     - Should **FAIL** with error (correct behavior)
   
4. **Complete Real Test Purchase**:
   - Use a **real card** (your own or authorized test card)
   - Complete checkout
   - Verify:
     - ✅ Payment succeeds
     - ✅ Redirected to success page
     - ✅ Subscription appears in user dashboard
     - ✅ User plan is updated in database

5. **Verify in Stripe Dashboard**:
   - Go to **Payments** → Should see the payment
   - Go to **Customers** → Should see the customer
   - Go to **Subscriptions** → Should see active subscription

6. **Cancel Test Subscription**:
   - In Stripe Dashboard → **Customers** → Select customer
   - **Actions** → **Cancel subscription**
   - Or use your app's cancel feature

---

### **Step 8: Monitor Webhooks**

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Click on your production endpoint**
3. **Check Recent Events**:
   - After test purchase, you should see events logged
   - ✅ All events should have status: **Succeeded**
   - ❌ If failed, check:
     - Webhook URL is correct
     - Endpoint is accessible (not blocked)
     - Check Vercel logs for errors

4. **View Logs in Vercel**:
   - Vercel Dashboard → **Logs**
   - Filter by `/api/webhooks/stripe`
   - Verify webhook events are being processed

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] ✅ All Stripe keys are in **Production** environment only (not Preview/Development)
- [ ] ✅ Live secret key (`sk_live_`) is **NOT** in `.env.local` or committed to Git
- [ ] ✅ Webhook endpoint is using HTTPS (Vercel default)
- [ ] ✅ Webhook secret is correctly configured
- [ ] ✅ Test mode keys are removed from production environment
- [ ] ✅ `.env.local` and `.env` are in `.gitignore`
- [ ] ✅ Stripe API version is pinned (check `src/lib/stripe/client.ts`)

---

## 🧹 Cleanup: Remove Test Mode Indicators

If there are any "Test Mode" banners or indicators in the UI:

### Option 1: Conditional Based on Key Type

```typescript
// src/lib/stripe/client.ts
export const isStripeTestMode = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  return key.startsWith('pk_test_')
}
```

Then in UI components:
```tsx
{isStripeTestMode() && (
  <div className="bg-yellow-100 text-yellow-800 p-2">
    ⚠️ Stripe Test Mode Active
  </div>
)}
```

### Option 2: Remove Hard-Coded Test Indicators

Search for any hard-coded test mode messages:
```bash
grep -r "test mode" src/
grep -r "Test Mode" src/
grep -r "testing" src/app/[locale]/plans
```

---

## 📊 Post-Launch Monitoring

### First Week Checklist

- [ ] Monitor Stripe Dashboard daily
- [ ] Check webhook delivery success rate
- [ ] Review failed payments and reasons
- [ ] Monitor subscription churn
- [ ] Check for fraudulent transactions
- [ ] Verify payout schedule is correct

### Stripe Dashboard Alerts

1. **Go to Settings** → **Notifications**
2. **Enable Email Alerts**:
   - ✅ Failed payments
   - ✅ Disputes and chargebacks
   - ✅ High-risk payments
   - ✅ Webhooks failing
   - ✅ Account issues

---

## 🆘 Troubleshooting

### Problem: Payments Fail with "Invalid API Key"

**Solution**:
- Verify `STRIPE_SECRET_KEY` in Vercel is the **live** key (`sk_live_`)
- Redeploy application after updating

### Problem: Webhook Events Not Received

**Solution**:
- Check webhook URL: `https://ai-knowledge-companion.vercel.app/api/webhooks/stripe`
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check Vercel logs for errors
- Test webhook: Stripe Dashboard → Webhooks → **Send test webhook**

### Problem: "Test Mode" Still Showing

**Solution**:
- Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_`
- Verify deployment picked up new environment variables

### Problem: Subscription Not Created in Database

**Solution**:
- Check webhook is firing: Stripe Dashboard → Webhooks → Logs
- Check Vercel logs: `/api/webhooks/stripe`
- Verify `checkout.session.completed` event is handled
- Check database connection in webhook handler

---

## 🔙 Rollback to Test Mode

If you need to revert to test mode:

1. **Vercel**: Replace live keys with test keys
2. **Redeploy** application
3. **Update Webhook** URL to point to test environment (if needed)

---

## ✅ Launch Checklist

Before announcing launch:

- [ ] ✅ All environment variables updated
- [ ] ✅ Production webhook configured and tested
- [ ] ✅ Real payment tested successfully
- [ ] ✅ Subscription created in database
- [ ] ✅ User plan updated correctly
- [ ] ✅ Email notifications work (if configured)
- [ ] ✅ Cancel/upgrade flow tested
- [ ] ✅ Stripe Dashboard alerts configured
- [ ] ✅ Terms of Service and Privacy Policy updated with payment terms
- [ ] ✅ Refund policy documented
- [ ] ✅ Customer support ready for billing questions

---

## 📚 Additional Resources

- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Stripe Security**: https://stripe.com/docs/security
- **Stripe API Versioning**: https://stripe.com/docs/api/versioning
- **PCI Compliance**: https://stripe.com/docs/security/guide

---

## 🎉 You're Live!

Once all steps are completed and tested, your Stripe integration is live and ready to accept real payments.

**Remember**: Monitor your Stripe Dashboard regularly, especially in the first few weeks, to catch any issues early.

Good luck with your launch! 🚀

