# Image Files Support in Subscription Plans

## Overview

This document describes the implementation of image files support in the subscription plans system.

## Changes Made

### 1. Database Schema

**File:** `sql/27_add_image_files_support.sql`

- Added `max_image_files` column to `subscription_plans` table
- Updated plan limits:
  - **Trial:** 5 images
  - **Pro:** 50 images
  - **Enterprise:** 200 images
- Updated PostgreSQL functions:
  - `get_user_subscription()` - now returns `max_image_files`
  - `check_usage_limit()` - now supports `'image'` resource type

### 2. TypeScript Types

**File:** `src/types/subscription.ts`

- Added `max_image_files: number` to `SubscriptionPlan` interface
- Added `max_image_files: number` to `UserSubscriptionWithPlan` interface

### 3. Features Builder

**File:** `src/lib/utils/plan-features.ts`

- Added image files feature to `buildPlanFeatures()` function
- Feature is displayed only if `max_image_files > 0`

### 4. Subscription Card Data

**File:** `src/lib/utils/subscription-card-data.ts`

- Added `featuresImageFiles` to `Translations` interface
- Updated `prepareUsageLimitsData()` to include `imageFilesLabel`

### 5. UI Components

**Files:**
- `src/components/plans/ui/subscription-card.tsx`
- `src/components/plans/ui/subscription-card/usage-limits-section.tsx`

**Changes:**
- Added `featuresImageFiles` translation key loading
- Added image files usage display in `UsageLimitsSection`
- Image files shown only if `max_image_files > 0`

### 6. Translations

**Files:** `messages/en.json`, `messages/it.json`

**English:**
```json
{
  "features": {
    "imageFiles": "Image Files"
  },
  "subscription": {
    "usage": {
      "imageFiles": "{current} of {max} image files"
    }
  }
}
```

**Italian:**
```json
{
  "features": {
    "imageFiles": "File Immagini"
  },
  "subscription": {
    "usage": {
      "imageFiles": "{current} di {max} file immagini"
    }
  }
}
```

## Plan Limits Summary

| Plan       | Tutors | Documents | Audio | Images | Video |
|------------|--------|-----------|-------|--------|-------|
| Trial      | 1      | 3         | 1     | 5      | 0     |
| Pro        | 10     | 50        | 20    | 50     | 0     |
| Enterprise | ∞      | 500       | 100   | 200    | 50    |

## How to Apply

1. **Run the migration script in Supabase:**
   ```sql
   -- Execute the content of sql/27_add_image_files_support.sql
   ```

2. **Verify the changes:**
   ```sql
   SELECT 
     name,
     display_name,
     max_tutors,
     max_documents,
     max_audio_files,
     max_video_files,
     max_image_files
   FROM subscription_plans
   ORDER BY sort_order;
   ```

3. **Expected output:**
   ```
   name       | display_name | max_tutors | max_documents | max_audio_files | max_video_files | max_image_files
   -----------|--------------|------------|---------------|-----------------|-----------------|----------------
   trial      | Trial        | 1          | 3             | 1               | 0               | 5
   pro        | Pro          | 10         | 50            | 20              | 0               | 50
   enterprise | Enterprise   | -1         | 500           | 100             | 50              | 200
   ```

## UI Impact

### Plans Page
- The pricing cards will now display "Image Files" feature
- Trial: "5 Image Files"
- Pro: "50 Image Files"
- Enterprise: "200 Image Files"

### Profile/Subscription Card
- The usage section will show image files count
- Format: "X of Y image files"
- Only displayed if the plan includes image files (max > 0)

### Multimedia Upload
- The `check_usage_limit` function now supports checking limits for `'image'` type
- Usage: `SELECT * FROM check_usage_limit('user_id', 'image')`

## Admin Users

- Admin and super_admin users continue to have **unlimited access** to all resources
- The `check_usage_limit` function returns `can_create: true, max_allowed: -1` for admins
- Admin users don't have subscriptions and see the "Unlimited Access" card

## Testing

1. **Check plan features display:**
   - Navigate to `/plans`
   - Verify all three plans show image files limits

2. **Check subscription card:**
   - Navigate to `/profile` as a normal user
   - Verify usage section shows image files count
   - Trial users should see "0 of 5 image files"

3. **Check admin access:**
   - Login as admin/super_admin
   - Navigate to `/profile`
   - Verify "Unlimited Access" card is displayed
   - No subscription or usage limits shown

4. **Test limit enforcement (when image upload is implemented):**
   ```sql
   SELECT * FROM check_usage_limit('user_id', 'image');
   ```

## Future Work

When image upload functionality is added:
1. Add `enforceUsageLimit(userId, 'image')` in the upload API route
2. Use the `image` media type when creating document records
3. Display image files in the multimedia page
4. Update the usage count in the subscription card (currently hardcoded to 0)

## Notes

- The `max_image_files` column is added with `NOT NULL DEFAULT 0`
- Existing plans are updated via the `UPDATE` statement in the migration
- The feature uses the same architecture as audio/video files
- Image files will be stored in the `documents` table with `media_type = 'image'`

