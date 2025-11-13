# 🔐 Stripe Webhook Setup for Production

This guide walks through setting up Stripe webhooks for production deployment on Vercel.

## 📋 Prerequisites

- ✅ Stripe account with API keys
- ✅ Application deployed on Vercel
- ✅ `STRIPE_SECRET_KEY` already configured in Vercel

## 🚀 Setup Steps

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint is:
```
https://ai-knowledge-companion.vercel.app/api/webhooks/stripe
```

### 2. Configure Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Production: https://dashboard.stripe.com/webhooks
   - Test: https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter Endpoint URL:**
   ```
   https://ai-knowledge-companion.vercel.app/api/webhooks/stripe
   ```

4. **Select Events to Listen:**
   ```
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ checkout.session.completed
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ```

5. **Click "Add endpoint"**

6. **Reveal Webhook Signing Secret:**
   - Click on the newly created endpoint
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

### 3. Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/gianmarioiamoni/ai-knowledge-companion/settings/environment-variables
   ```

2. **Add Environment Variable:**
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxx...` (paste your webhook secret)
   - **Environment:** ✅ Production (and optionally Preview/Development)

3. **Click "Save"**

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - OR: Push a new commit to trigger redeploy

### 4. Test the Webhook

#### Option A: From Stripe Dashboard
1. Go to your webhook endpoint in Stripe
2. Click "Send test webhook"
3. Select an event type (e.g., `checkout.session.completed`)
4. Click "Send test webhook"

#### Option B: Using Stripe CLI
```bash
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to https://ai-knowledge-companion.vercel.app/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

### 5. Verify Webhook is Working

1. **Check Vercel Logs:**
   ```
   https://vercel.com/gianmarioiamoni/ai-knowledge-companion/logs
   ```
   
   Look for:
   ```
   ✅ Successfully handled checkout.session.completed
   ✅ Successfully handled customer.subscription.created
   ```

2. **Check Stripe Dashboard:**
   - Go to Webhooks → Your endpoint
   - Check "Recent deliveries" tab
   - Should show successful deliveries (green checkmark)

## 🔍 Troubleshooting

### Webhook Signature Verification Failed

**Error:**
```
❌ Webhook signature verification failed
```

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches the one in Stripe Dashboard
- Make sure you copied the **Signing secret**, not the API key
- Redeploy after updating environment variables

### No Signature Provided

**Error:**
```
❌ No stripe-signature header found
```

**Solution:**
- Verify the webhook URL is correct
- Check that Stripe is sending requests to the production URL
- Ensure no proxy/firewall is stripping headers

### Webhook Events Not Being Received

**Checklist:**
- ✅ Webhook endpoint is added in Stripe Dashboard
- ✅ Correct events are selected
- ✅ Webhook URL matches production URL exactly
- ✅ `STRIPE_WEBHOOK_SECRET` is set in Vercel
- ✅ Application has been redeployed after adding secret

## 📊 Monitored Events

Our webhook handler processes these events:

| Event | Description | Handler Action |
|-------|-------------|----------------|
| `checkout.session.completed` | Payment successful | Activate subscription |
| `customer.subscription.created` | New subscription | Create subscription record |
| `customer.subscription.updated` | Subscription changed | Update subscription status |
| `customer.subscription.deleted` | Subscription cancelled | Deactivate subscription |
| `invoice.payment_succeeded` | Recurring payment OK | Renew subscription |
| `invoice.payment_failed` | Payment failed | Mark subscription as past_due |

## 🔐 Security Notes

- ✅ Webhook signature verification is **mandatory**
- ✅ Uses Stripe's signature to verify authenticity
- ✅ Prevents unauthorized webhook calls
- ✅ Only processes events from Stripe

## ✅ Success Criteria

You'll know the webhook is working when:

1. **Stripe Dashboard** shows successful deliveries (green checkmarks)
2. **Vercel Logs** show `✅ Successfully handled [event-type]`
3. **User subscriptions** update correctly after payments
4. **No signature verification errors** in logs

---

## 📝 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_live_xxxxx...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_xxxxx...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_xxxxx...` |

---

## 🚨 Important Notes

1. **Different Secrets for Test vs Live:**
   - Test webhook secret: `whsec_...` (from test mode)
   - Live webhook secret: `whsec_...` (from live mode)
   - Use correct one based on environment

2. **Webhook Retries:**
   - Stripe automatically retries failed webhooks
   - Up to 3 days with exponential backoff
   - Always return 200 OK even if processing fails internally

3. **Idempotency:**
   - Webhook handler should be idempotent
   - Same event may be delivered multiple times
   - Use event ID to deduplicate if needed

---

## 🎯 Next Steps

After webhook is working:
1. ✅ Test subscription flow end-to-end
2. ✅ Monitor webhook logs for errors
3. ✅ Set up alerts for webhook failures
4. ✅ Document any custom webhook logic

---

**Need Help?**
- 📖 Stripe Webhooks Docs: https://stripe.com/docs/webhooks
- 🛠️ Stripe CLI: https://stripe.com/docs/stripe-cli
- 📊 Webhook Testing: https://stripe.com/docs/webhooks/test

