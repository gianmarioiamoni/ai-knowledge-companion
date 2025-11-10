# Scheduled Plan Changes & Proration Implementation

## Overview

This document details the implementation of two advanced Stripe features:
1. **Scheduled Plan Changes**: Display when a user has scheduled a plan change to take effect at period end
2. **Proration Notifications**: Show prorated charges when users upgrade mid-cycle

## Features

### 1. Scheduled Plan Changes

When a user downgrades from a higher-tier plan (e.g., Enterprise → Pro), Stripe schedules the change to occur at the end of the current billing period. This ensures the user gets full value from their existing subscription.

**User Experience:**
```
┌──────────────────────────────────────────────────────────┐
│ ℹ️  Scheduled Plan Change                                 │
│                                                           │
│ Your plan will change from Enterprise (Monthly) to       │
│ Pro (Monthly)                                             │
│                                                           │
│ 📅 Effective Date: December 31, 2024                     │
│                                                           │
│ 💡 Your current plan benefits will remain active until   │
│    the change date.                                       │
└──────────────────────────────────────────────────────────┘
```

### 2. Proration Notifications

When a user upgrades mid-cycle (e.g., Pro → Enterprise), Stripe charges a prorated amount for the remaining days of the billing period.

**User Experience:**
```
┌──────────────────────────────────────────────────────────┐
│ 💵 Prorated Charge Applied                                │
│                                                           │
│ You've been charged USD 15.50 for the remaining days of  │
│ this billing cycle.                                       │
└──────────────────────────────────────────────────────────┘
```

## Implementation Details

### Database Schema

**Migration:** `sql/30_scheduled_plan_changes.sql`

#### New Columns in `user_subscriptions`

```sql
-- Scheduled plan change fields
scheduled_plan_id UUID REFERENCES subscription_plans(id)
scheduled_billing_cycle VARCHAR(10) CHECK IN ('monthly', 'yearly')
scheduled_change_date TIMESTAMPTZ
scheduled_price_id VARCHAR(255)
```

#### New PostgreSQL Functions

1. **`schedule_plan_change()`**: Records a scheduled plan change
2. **`apply_scheduled_plan_change()`**: Applies the scheduled change (called by webhook/cron)
3. **`cancel_scheduled_plan_change()`**: Cancels a pending plan change

### TypeScript Types

**File:** `src/types/subscription.ts`

```typescript
export interface UserSubscriptionWithPlan {
  // ... existing fields
  
  // Scheduled plan change fields
  scheduled_plan_id?: string | null
  scheduled_plan_name?: PlanName | null
  scheduled_plan_display_name?: string | null
  scheduled_billing_cycle?: BillingCycle | null
  scheduled_change_date?: string | null
}
```

### Backend: Stripe Webhook Handlers

**File:** `src/lib/stripe/webhook.ts`

#### Enhanced `handleSubscriptionUpdated()`

Now detects when a subscription has an associated schedule:

```typescript
if (subscription.schedule) {
  console.log('📅 Subscription has a schedule:', subscription.schedule)
}
```

#### Enhanced `handleInvoicePaid()`

Detects proration charges and stores them in user metadata:

```typescript
const hasProration = invoice.lines.data.some(line => line.proration)
if (hasProration) {
  const prorationAmount = invoice.lines.data
    .filter(line => line.proration)
    .reduce((sum, line) => sum + (line.amount / 100), 0)
  
  // Store in profiles.metadata for notification
  await supabase
    .from('profiles')
    .update({
      metadata: {
        last_proration: {
          amount: prorationAmount,
          currency: invoice.currency.toUpperCase(),
          date: new Date().toISOString(),
          invoice_id: invoice.id
        }
      }
    })
    .eq('id', subscription.user_id)
}
```

### Frontend: UI Components

#### 1. Scheduled Plan Banner

**File:** `src/components/plans/ui/subscription-card/scheduled-plan-banner.tsx`

Displays a blue info banner with:
- Current and scheduled plan names
- Effective date (formatted)
- Helpful note based on upgrade/downgrade direction

**Usage:**
```tsx
<ScheduledPlanBanner
  scheduledPlanName="Pro"
  scheduledBillingCycle="monthly"
  scheduledChangeDate="2024-12-31T00:00:00Z"
  currentPlanName="Enterprise"
  currentBillingCycle="monthly"
  titleText="Scheduled Plan Change"
  descriptionText="Your plan will change from {current} to {scheduled}"
  effectiveDateText="Effective Date"
/>
```

#### 2. Enhanced Payment Status

**File:** `src/components/stripe/payment-status.tsx`

Now displays proration notifications in addition to payment status messages.

**New Hook:** `useProrationInfo()`
- Fetches proration data from `profiles.metadata`
- Only shows if recent (within 10 minutes)
- Auto-clears after display

**Display Logic:**
```tsx
{prorationInfo && (
  <Alert className="border-blue-500 bg-blue-50">
    <DollarSign className="h-4 w-4 text-blue-600" />
    <AlertTitle>Prorated Charge Applied</AlertTitle>
    <AlertDescription>
      You've been charged {currency} {amount} for the remaining days...
    </AlertDescription>
  </Alert>
)}
```

#### 3. Updated Subscription Card

**File:** `src/components/plans/ui/subscription-card.tsx`

Now checks for `scheduled_plan_id` and conditionally renders `ScheduledPlanBanner`:

```typescript
const hasScheduledChange = !!subscription.scheduled_plan_id

{hasScheduledChange && subscription.scheduled_plan_display_name && (
  <ScheduledPlanBanner {...scheduledProps} />
)}
```

### Translations

#### English (`messages/en.json`)

```json
"payment": {
  "prorationTitle": "Prorated Charge Applied",
  "prorationDescription": "You've been charged {currency} {amount} for the remaining days of this billing cycle."
},
"scheduledChange": {
  "title": "Scheduled Plan Change",
  "description": "Your plan will change from {current} to {scheduled}",
  "effectiveDate": "Effective Date",
  "currentBenefitsNote": "Your current plan benefits will remain active until the change date.",
  "upgradeNote": "You'll be charged a prorated amount for the remaining days when upgrading."
}
```

#### Italian (`messages/it.json`)

```json
"payment": {
  "prorationTitle": "Addebito Proporzionale Applicato",
  "prorationDescription": "Ti è stato addebitato {currency} {amount} per i giorni rimanenti del ciclo di fatturazione."
},
"scheduledChange": {
  "title": "Cambio Piano Programmato",
  "description": "Il tuo piano cambierà da {current} a {scheduled}",
  "effectiveDate": "Data Effettiva",
  "currentBenefitsNote": "I vantaggi del tuo piano attuale rimarranno attivi fino alla data del cambio.",
  "upgradeNote": "Ti verrà addebitato un importo proporzionale per i giorni rimanenti quando effettuerai l'upgrade."
}
```

## User Flows

### Flow 1: Downgrade (Enterprise → Pro)

1. **User Action**: Clicks "Change Plan" → Selects Pro plan
2. **Stripe**: Creates subscription schedule for end of period
3. **Webhook**: `customer.subscription.updated` fired
4. **Database**: `scheduled_plan_id` populated via SQL function
5. **UI**: Blue banner appears in Profile → Subscription

```
Current Plan: Enterprise (Monthly)
┌─────────────────────────────────────────┐
│ ℹ️  Scheduled Plan Change               │
│ Pro (Monthly) - Effective: Dec 31, 2024│
└─────────────────────────────────────────┘
```

6. **On Change Date**: 
   - Webhook: `customer.subscription.updated` (or cron job)
   - Database: `apply_scheduled_plan_change()` executed
   - UI: Banner disappears, current plan updates to Pro

### Flow 2: Upgrade (Pro → Enterprise)

1. **User Action**: Clicks "Change Plan" → Selects Enterprise
2. **Stripe**: Immediately upgrades, charges proration
3. **Webhook**: `invoice.paid` fired with proration line items
4. **Database**: Proration stored in `profiles.metadata.last_proration`
5. **Redirect**: User returns to `/dashboard?payment=success`
6. **UI**: Two alerts shown:

```
┌──────────────────────────────────────────────┐
│ 💵 Prorated Charge Applied                   │
│ You've been charged USD 15.50 for remaining  │
│ days of this billing cycle.                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ✅ Payment successful!                        │
│ Your subscription has been activated.        │
└──────────────────────────────────────────────┘
```

7. **After 10 minutes**: Proration alert auto-disappears

## Testing

### Setup

1. **Run Database Migration:**
```bash
# Execute sql/30_scheduled_plan_changes.sql in Supabase SQL Editor
```

2. **Configure Stripe Webhook:**
Ensure your Stripe webhook listens to:
- `customer.subscription.updated`
- `invoice.paid`

### Test Case 1: Scheduled Downgrade

1. Create user with Enterprise plan
2. Navigate to Profile → Subscription
3. Click "Manage Subscription" (Stripe Portal)
4. Downgrade to Pro plan
5. **Expected**: Blue "Scheduled Plan Change" banner appears
6. **Verify Database**:
```sql
SELECT 
  scheduled_plan_id,
  scheduled_billing_cycle,
  scheduled_change_date
FROM user_subscriptions 
WHERE user_id = 'YOUR_USER_ID';
```

### Test Case 2: Immediate Upgrade with Proration

1. Create user with Pro plan
2. Navigate to Plans page
3. Click "Subscribe Now" on Enterprise
4. Complete Stripe checkout (test card: `4242 4242 4242 4242`)
5. **Expected**: Redirect to `/dashboard?payment=success`
6. **Expected**: Two alerts:
   - Proration notification (if mid-cycle)
   - Payment success message
7. **Verify Database**:
```sql
SELECT 
  metadata->'last_proration' as proration
FROM profiles 
WHERE id = 'YOUR_USER_ID';
```

### Test Case 3: Proration Auto-Dismissal

1. After seeing proration notification, wait 10 minutes
2. Refresh page
3. **Expected**: Proration notification no longer appears
4. **Expected**: Payment success still shows (until dismissed)

## Stripe Portal Behavior

When users access Stripe Customer Portal:

### Downgrade Scenario
- Stripe shows: "Your plan will change to Pro on Dec 31, 2024"
- User can cancel the scheduled change
- If cancelled, webhook updates database and banner disappears

### Upgrade Scenario
- Stripe immediately applies new plan
- Shows prorated invoice
- Invoice webhook captures proration amount

## Future Enhancements

### 1. Email Notifications

Send email to user when:
- Plan change is scheduled
- Scheduled change is applied
- Upgrade occurs with proration

**Implementation TODO:**
- Add email service integration
- Create email templates
- Trigger from webhook handlers

### 2. Proration Preview

Before completing upgrade, show estimated proration:

```
┌──────────────────────────────────────────┐
│ Upgrade Summary                          │
│                                          │
│ New Plan: Enterprise (Monthly)           │
│ Prorated Charge: ~$15.50                 │
│ Next Full Charge: $99.00 on Jan 15      │
│                                          │
│ [Confirm Upgrade]  [Cancel]              │
└──────────────────────────────────────────┘
```

**Implementation TODO:**
- Calculate proration in frontend
- Show preview in checkout flow
- Use Stripe's `proration_date` parameter

### 3. Scheduled Change Management

Allow users to cancel scheduled changes from UI (not just Stripe Portal):

```
┌──────────────────────────────────────────┐
│ ℹ️  Scheduled Plan Change                │
│ Pro (Monthly) - Effective: Dec 31, 2024  │
│                                          │
│ [Cancel Scheduled Change]                │
└──────────────────────────────────────────┘
```

**Implementation TODO:**
- Add "Cancel" button to banner
- Create API route to call `cancel_scheduled_plan_change()`
- Update Stripe subscription (remove schedule)

## Related Files

### Database
- `sql/30_scheduled_plan_changes.sql`

### Types
- `src/types/subscription.ts`

### Backend
- `src/lib/stripe/webhook.ts`

### Hooks
- `src/hooks/use-proration-info.ts`

### Components
- `src/components/plans/ui/subscription-card.tsx`
- `src/components/plans/ui/subscription-card/scheduled-plan-banner.tsx`
- `src/components/stripe/payment-status.tsx`

### Translations
- `messages/en.json`
- `messages/it.json`

## References

- [Stripe Subscription Schedules](https://stripe.com/docs/billing/subscriptions/subscription-schedules)
- [Stripe Proration](https://stripe.com/docs/billing/subscriptions/prorations)
- [Stripe Invoice Line Items](https://stripe.com/docs/api/invoices/line_item)
- [Stripe Customer Portal - Proration Settings](https://stripe.com/docs/billing/subscriptions/customer-portal#proration)

