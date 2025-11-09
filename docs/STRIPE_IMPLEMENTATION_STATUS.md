# Stripe Implementation Status

## ✅ COMPLETED

### 1. Dependencies
- ✅ Installed `stripe@19.3.0`
- ✅ Installed `@stripe/stripe-js@8.3.0`

### 2. Database Schema
- ✅ Created `sql/28_stripe_integration.sql`
- ✅ Added `stripe_customer_id` to `profiles`
- ✅ Added Stripe fields to `user_subscriptions`
- ✅ Added Stripe price IDs to `subscription_plans`
- ✅ Created PostgreSQL helper functions

### 3. Backend Services (SRP Architecture)
- ✅ `src/lib/stripe/client.ts` - Client initialization
- ✅ `src/lib/stripe/customer.ts` - Customer management
- ✅ `src/lib/stripe/checkout.ts` - Checkout sessions
- ✅ `src/lib/stripe/subscription.ts` - Subscription management
- ✅ `src/lib/stripe/webhook.ts` - Webhook event handlers
- ✅ `src/lib/stripe/index.ts` - Central exports

### 4. API Routes
- ✅ `/api/stripe/create-checkout-session` - Create checkout
- ✅ `/api/stripe/create-portal-session` - Create portal session
- ✅ `/api/webhooks/stripe` - Webhook handler

### 5. Frontend Hooks
- ✅ `use-stripe-checkout.ts` - Checkout hook
- ✅ `use-stripe-portal.ts` - Portal hook

### 6. Translations
- ✅ English translations (`messages/en.json`)
- ✅ Italian translations (`messages/it.json`)
- ✅ Added `plans.payment.*` keys for all payment-related UI

### 7. Environment Variables
- ✅ Updated `env.example` with Stripe configuration

### 8. Scripts
- ✅ Created `scripts/update-stripe-price-ids.ts`

### 9. Documentation
- ✅ Created `docs/STRIPE_INTEGRATION_GUIDE.md` (complete setup guide)

---

## 🔨 REMAINING TASKS

### 1. UI Components (with SRP)

Need to create:

#### a) Checkout Button Component
```
src/components/stripe/checkout-button.tsx
```
- Single responsibility: Trigger Stripe checkout
- Uses `useStripeCheckout` hook
- Shows loading state
- Displays errors
- Integrates with `PricingCard`

#### b) Portal Button Component
```
src/components/stripe/portal-button.tsx
```
- Single responsibility: Open Stripe Customer Portal
- Uses `useStripePortal` hook
- Shows loading state
- Displays errors
- Integrates with `SubscriptionCard`

#### c) Payment Status Component
```
src/components/stripe/payment-status.tsx
```
- Single responsibility: Show payment result messages
- Displays success/cancelled/failed messages
- Auto-dismiss after N seconds
- Used in dashboard/profile pages

### 2. Update Plans Page

**File:** `src/components/plans/ui/pricing-card.tsx`

Changes needed:
- Replace current `onSelect` logic with Stripe checkout
- Add `CheckoutButton` component
- Pass `planName` and `billingCycle` to checkout
- Show loading state during checkout creation
- Disable button during checkout process

### 3. Update Profile/Subscription Page

**File:** `src/components/plans/ui/subscription-card.tsx`

Changes needed:
- Add "Manage Subscription" button
- Integrate `PortalButton` component
- Show button only for active subscriptions
- Handle loading/error states

### 4. Database Setup (User Action Required)

User needs to:
1. Run `sql/28_stripe_integration.sql` in Supabase SQL Editor
2. Run `npx tsx scripts/update-stripe-price-ids.ts` to sync Price IDs

### 5. Webhook Setup (User Action Required - After Deployment)

User needs to:
1. Deploy the app (or use Stripe CLI for local testing)
2. Configure webhook in Stripe Dashboard:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: See `docs/STRIPE_INTEGRATION_GUIDE.md`
   - Get webhook signing secret
   - Add `STRIPE_WEBHOOK_SECRET` to `.env.local`

### 6. Testing Checklist

Need to test:
- [ ] Checkout flow (monthly)
- [ ] Checkout flow (yearly)
- [ ] PayPal payment method
- [ ] Card payment method
- [ ] Portal access
- [ ] Plan change
- [ ] Subscription cancellation
- [ ] Webhook events processing
- [ ] Database synchronization

---

## 📝 NEXT STEPS FOR IMPLEMENTATION

### Step 1: Create UI Components

```bash
# Create checkout button
src/components/stripe/checkout-button.tsx

# Create portal button
src/components/stripe/portal-button.tsx

# Create payment status
src/components/stripe/payment-status.tsx
```

### Step 2: Integrate with Plans Page

Modify:
- `src/components/plans/ui/pricing-card.tsx`
- `src/hooks/use-pricing-card-state.ts` (if needed)

### Step 3: Integrate with Profile Page

Modify:
- `src/components/plans/ui/subscription-card.tsx`
- `src/components/plans/ui/subscription-card/subscription-actions.tsx`

### Step 4: Add Payment Status to Dashboard

Modify:
- `src/components/dashboard/pages/dashboard-page-client.tsx`
- Show success message on `?payment=success`
- Show cancelled message on `?payment=cancelled`

---

## 🎯 IMPLEMENTATION GUIDELINES

### SRP for UI Components

Each component should have ONE responsibility:

1. **CheckoutButton:**
   - Responsibility: Initiate Stripe checkout
   - Logic: In `use-stripe-checkout` hook
   - UI: Button with loading state

2. **PortalButton:**
   - Responsibility: Open Stripe portal
   - Logic: In `use-stripe-portal` hook
   - UI: Button with loading state

3. **PaymentStatus:**
   - Responsibility: Display payment result
   - Logic: Parse URL params
   - UI: Success/error message

### Example Component Structure

```tsx
// checkout-button.tsx
import { useStripeCheckout } from '@/hooks/use-stripe-checkout'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  planName: 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
  disabled?: boolean
}

export function CheckoutButton({ 
  planName, 
  billingCycle, 
  disabled 
}: CheckoutButtonProps) {
  const t = useTranslations('plans.payment')
  const { createCheckoutSession, loading, error } = useStripeCheckout()

  const handleClick = async () => {
    await createCheckoutSession({ planName, billingCycle })
  }

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full"
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {loading ? t('processing') : t('subscribe')}
      </Button>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}
```

---

## 🚨 IMPORTANT NOTES

1. **Trial Plan:** The Trial plan should NOT have Stripe integration
   - It's automatically assigned to new users
   - No payment required
   - Only Pro and Enterprise need Stripe checkout

2. **Admin Users:** Admin/super_admin should NOT see Stripe integration
   - They have unlimited access
   - No subscription required
   - Hide checkout buttons for admins

3. **Current Plan:** Don't show checkout button if user is already on that plan
   - Show "Current Plan" badge instead
   - Allow upgrade/downgrade to other plans

4. **Proration:** Stripe handles proration automatically
   - When upgrading: Charge difference immediately
   - When downgrading: Credit applied to next invoice

5. **Webhook Retry:** Stripe retries failed webhooks automatically
   - Return 200 even if handler fails
   - Log errors for debugging
   - Fix issues and let Stripe retry

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                        USER FLOW                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Plans Page (pricing-card.tsx)                              │
│    └─> CheckoutButton                                       │
│         └─> useStripeCheckout                               │
│              └─> POST /api/stripe/create-checkout-session   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Stripe Checkout Page (hosted by Stripe)                    │
│    - Card payment                                           │
│    - PayPal payment                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Webhook: checkout.session.completed                        │
│    └─> handleCheckoutSessionCompleted()                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Webhook: customer.subscription.created                     │
│    └─> handleSubscriptionCreated()                          │
│         └─> syncSubscriptionToDatabase()                    │
│              └─> upsert_subscription_from_stripe()          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Success Redirect: /dashboard?payment=success               │
│    └─> PaymentStatus component shows success message        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ QUALITY CHECKLIST

Before marking complete, verify:

- [ ] All components follow SRP
- [ ] All UI text is translated (EN/IT)
- [ ] Loading states are handled
- [ ] Error states are handled
- [ ] Admin users are excluded from payments
- [ ] Trial plan doesn't show checkout
- [ ] Current plan shows correct badge
- [ ] Webhook events are logged
- [ ] Database sync is working
- [ ] Tests are passing (if applicable)

---

## 📚 REFERENCES

- Full setup guide: `docs/STRIPE_INTEGRATION_GUIDE.md`
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Docs: https://stripe.com/docs/api
- Stripe Webhook Docs: https://stripe.com/docs/webhooks


