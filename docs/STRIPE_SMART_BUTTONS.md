# Smart Subscription Buttons Implementation

## Overview

This document explains the implementation of intelligent subscription management buttons that adapt based on whether a user has a Stripe subscription or a manual/trial subscription.

## Problem Statement

Previously, the subscription card showed two buttons that could be confusing:

1. **Manage Subscription** (Stripe Portal) - Always visible, but would error for trial users
2. **Change Plan** - Navigate to `/plans` page

This created UX issues:
- Trial users would get errors when clicking "Manage Subscription"
- It wasn't clear which button to use
- Redundant functionality

## Solution

Implemented a **single, smart button** that changes based on subscription type:

### For Stripe Customers
- **Shows:** "Manage Subscription" (opens Stripe Customer Portal)
- **Allows:**
  - Change payment method
  - View invoices
  - Cancel subscription
  - Update billing information

### For Trial/Manual Users
- **Shows:** "Change Plan" (navigates to `/plans`)
- **Allows:**
  - Upgrade to a paid plan
  - Compare plan features
  - Choose billing cycle

## Implementation Details

### 1. Database Schema Updates

**Migration:** `sql/29_add_stripe_fields_to_subscription_query.sql`

Updated `get_user_subscription()` PostgreSQL function to return:
```sql
stripe_subscription_id VARCHAR,
stripe_price_id VARCHAR
```

These fields indicate whether the subscription is managed by Stripe.

### 2. TypeScript Types

**File:** `src/types/subscription.ts`

```typescript
export interface UserSubscriptionWithPlan {
  // ... existing fields
  
  // Stripe fields
  stripe_subscription_id?: string | null
  stripe_price_id?: string | null
  stripe_payment_method?: string | null
}
```

### 3. Component Logic

**File:** `src/components/plans/ui/subscription-card/subscription-actions.tsx`

```typescript
{isActive && hasStripeSubscription ? (
  // User paid via Stripe - show Portal button
  <PortalButton variant="default" className="w-full" />
) : (
  // User on trial or manual plan - show Change Plan button
  <Button onClick={() => router.push('/plans')}>
    {changePlanText}
  </Button>
)}
```

**File:** `src/components/plans/ui/subscription-card.tsx`

```typescript
// Check if user has a Stripe subscription
const hasStripeSubscription = !!subscription.stripe_subscription_id
```

### 4. Locale Support

Both checkout and portal sessions now include locale in redirect URLs:

**Checkout Success:** `/{locale}/dashboard?payment=success`
**Portal Return:** `/{locale}/profile?tab=subscription`

This ensures users are redirected to the correct language version after Stripe interactions.

## User Experience Flow

### Scenario 1: Trial User
1. User sees "Change Plan" button
2. Clicks button → navigates to `/plans`
3. Selects paid plan → checkout flow
4. After payment → becomes Stripe customer
5. Button changes to "Manage Subscription"

### Scenario 2: Stripe Customer
1. User sees "Manage Subscription" button
2. Clicks button → redirects to Stripe Portal
3. Can manage payment, view invoices, cancel
4. Returns to `/profile?tab=subscription`

## Error Prevention

The previous implementation would show a 500 error for trial users:
```
Error: No Stripe customer found. Please subscribe to a plan first.
```

The new implementation **prevents this error** by:
- Checking `stripe_subscription_id` before rendering portal button
- Only showing portal button to actual Stripe customers
- Providing alternative "Change Plan" action for non-Stripe users

## Testing

### Test Case 1: Trial User
1. Create new user (auto-assigned trial plan)
2. Navigate to Profile → Subscription tab
3. **Expected:** See "Change Plan" button
4. Click button → should navigate to `/plans`

### Test Case 2: Stripe Customer
1. User with paid subscription via Stripe
2. Navigate to Profile → Subscription tab
3. **Expected:** See "Manage Subscription" button
4. Click button → should open Stripe Portal
5. Return → should be back at `/profile?tab=subscription`

### Test Case 3: Language Switching
1. Switch to Italian (`/it/profile`)
2. Click "Manage Subscription"
3. After Stripe Portal → return to `/it/profile?tab=subscription` (not `/en/`)

## Future Enhancements

### Pending Plan Changes (Scheduled)
When a user downgrades from Enterprise to Pro, Stripe schedules the change for the end of the billing period. We should display:

```
Current Plan: Enterprise (Monthly)
Scheduled Change: Pro (Monthly) - Effective Dec 31, 2024
```

**Implementation TODO:**
1. Add `scheduled_plan_id` to `user_subscriptions` table
2. Update webhook handlers to capture `subscription.schedule.created`
3. Display scheduled changes in `SubscriptionDetails` component

### Proration Notifications
When a user upgrades mid-cycle, they're charged a prorated amount. We should show:

```
✓ Payment successful! 
You've been charged $X.XX for the remaining days of this billing cycle.
```

**Implementation TODO:**
1. Capture proration amount from Stripe webhook
2. Store in session/temporary storage
3. Display in `PaymentStatus` component after redirect

## Related Files

- `sql/29_add_stripe_fields_to_subscription_query.sql`
- `src/types/subscription.ts`
- `src/components/plans/ui/subscription-card/subscription-actions.tsx`
- `src/lib/utils/subscription-card-data.ts`
- `src/app/api/stripe/create-portal-session/route.ts`
- `src/hooks/use-stripe-portal.ts`
- `src/app/api/stripe/create-checkout-session/route.ts`
- `src/hooks/use-stripe-checkout.ts`

## References

- [Stripe Customer Portal Documentation](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Proration Guide](https://stripe.com/docs/billing/subscriptions/prorations)

