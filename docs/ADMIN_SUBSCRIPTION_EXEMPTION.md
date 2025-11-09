# Admin Exemption from Subscription Limits

## Overview
Administrators (both `admin` and `super_admin` roles) have unlimited access to all features without subscription restrictions. This ensures admins can fully manage and test the platform without being constrained by plan limits.

## Implementation

### 1. Database Layer (PostgreSQL)

#### Updated Function: `check_usage_limit`
```sql
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_resource_type VARCHAR
)
```

**Changes:**
- Added role check at the beginning of the function
- Returns unlimited access for admin/super_admin roles
- Normal users continue to follow subscription limits

**Logic Flow:**
1. Check user's role from `profiles` table
2. If role is `admin` or `super_admin`: return `(true, 0, -1, 'Unlimited (Admin)')`
3. Otherwise, proceed with normal subscription limit checks

#### Updated Function: `get_user_subscription`
```sql
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
```

**Changes:**
- Returns NULL for admin/super_admin users (they don't have subscriptions)
- Normal users get their subscription data as before

#### Updated Trigger Function: `assign_trial_plan`
```sql
CREATE OR REPLACE FUNCTION assign_trial_plan()
```

**Changes:**
- Skips trial plan assignment for admin/super_admin users
- Normal users automatically get trial plan on registration

### 2. Application Layer (TypeScript)

#### Updated Component: `SubscriptionCard`
**File:** `src/components/plans/ui/subscription-card/subscription-card.tsx`

**Changes:**
- Added `useRole` hook to check if user is admin
- Three rendering states:
  1. **Loading**: Shows spinner while checking role and subscription
  2. **Admin**: Shows `AdminUnlimitedAccess` component
  3. **Normal User**: Shows subscription details or empty state

#### New Component: `AdminUnlimitedAccess`
**File:** `src/components/plans/ui/subscription-card/admin-unlimited-access.tsx`

**Features:**
- Special card with amber/gold theme (Crown icon)
- Shows "Admin" badge
- Displays unlimited access for all resources:
  - Tutors
  - Documents
  - Audio Files
  - Video Files
- Clear messaging about admin privileges

### 3. API Routes

All existing API routes that use `enforceUsageLimit` automatically benefit from the database-level admin exemption:
- `/api/tutors/create` - Tutor creation
- `/api/multimedia/upload` - Multimedia file uploads
- Any future resource creation endpoints

**No API changes needed** - the exemption is handled at the database function level.

### 4. Translation Keys

#### English (`messages/en.json`)
```json
"plans.subscription": {
  "adminTitle": "Administrator Access",
  "adminDesc": "You have unlimited access to all features without subscription restrictions",
  "usage": {
    "unlimitedAccess": "Unlimited Access"
  }
}
```

#### Italian (`messages/it.json`)
```json
"plans.subscription": {
  "adminTitle": "Accesso Amministratore",
  "adminDesc": "Hai accesso illimitato a tutte le funzionalità senza restrizioni di abbonamento",
  "usage": {
    "unlimitedAccess": "Accesso Illimitato"
  }
}
```

## Usage Examples

### Admin User Flow
1. Admin logs in
2. Navigates to profile → sees `AdminUnlimitedAccess` card
3. Creates tutors/documents/multimedia → no limits enforced
4. Never sees plan upgrade prompts

### Normal User Flow
1. User registers → automatically gets trial plan
2. Navigates to profile → sees `SubscriptionCard` with trial info
3. Creates resources → limits enforced based on plan
4. Can upgrade to paid plans

## Testing

### Test Admin Access
```sql
-- Check admin can bypass limits
SELECT * FROM check_usage_limit(
  '<admin_user_id>',
  'tutors'
);
-- Expected: (true, 0, -1, 'Unlimited (Admin)')
```

### Test Normal User Access
```sql
-- Check normal user follows limits
SELECT * FROM check_usage_limit(
  '<normal_user_id>',
  'tutors'
);
-- Expected: (can_create, current_count, max_allowed, message)
```

### Test Subscription Retrieval
```sql
-- Admin should get NULL
SELECT * FROM get_user_subscription('<admin_user_id>');
-- Expected: No rows

-- Normal user should get subscription
SELECT * FROM get_user_subscription('<normal_user_id>');
-- Expected: Subscription details
```

## Migration

Run the migration script:
```bash
# Apply to Supabase
psql -h <supabase-host> -U postgres -d postgres -f sql/26_exempt_admins_from_limits.sql
```

Or via Supabase SQL Editor:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `sql/26_exempt_admins_from_limits.sql`
3. Execute

## Benefits

✅ **Admins can fully test the platform** without artificial restrictions
✅ **No need for "admin plans"** in the database
✅ **Centralized logic** at database level (single source of truth)
✅ **Automatic propagation** to all API endpoints using `check_usage_limit`
✅ **Clear visual feedback** with dedicated admin UI component
✅ **Minimal code changes** - leverages existing infrastructure

## Future Enhancements

- [ ] Add admin activity logging for resource creation
- [ ] Add admin dashboard showing resource usage statistics
- [ ] Add ability for admins to temporarily grant unlimited access to specific users
- [ ] Add admin notifications when system-wide limits are approached

