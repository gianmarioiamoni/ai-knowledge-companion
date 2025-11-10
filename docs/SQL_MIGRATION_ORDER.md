# SQL Migration Scripts - Execution Order

## ⚠️ IMPORTANT: Execute Scripts in Order

The SQL migration scripts must be executed **in numerical order** to avoid dependency errors.

## Prerequisites for Image Support

Before running `31_image_support.sql`, you **must** have executed these scripts:

### 1. Multimedia Base Schema (REQUIRED)
```sql
19_multimedia_schema.sql       -- Creates multimedia_documents table
20_multimedia_storage.sql      -- Creates storage buckets and policies
21_fix_multimedia_rls.sql      -- Fixes RLS policies for multimedia
```

### 2. Subscription Plans (REQUIRED)
```sql
25_subscription_plans.sql      -- Creates subscription system
27_add_image_files_support.sql -- Adds max_image_files to plans
```

### 3. Image Support (FINAL)
```sql
31_image_support.sql           -- Adds images bucket and policies
```

## Step-by-Step Guide

### If Starting Fresh

Execute all scripts in numerical order:

1. **Core Schema** (01-18)
   ```sql
   01_documents_schema.sql
   02_storage_setup.sql
   03_similarity_search_clean.sql
   04_tutors_schema_fixed.sql
   05_chat_schema_clean.sql
   ... (continue in order)
   ```

2. **Multimedia Support** (19-23)
   ```sql
   19_multimedia_schema.sql        -- ✅ REQUIRED for images
   20_multimedia_storage.sql       -- ✅ REQUIRED for images
   21_fix_multimedia_rls.sql       -- ✅ REQUIRED for images
   22_fix_worker_function.sql
   23_update_audio_bucket_mime_types.sql
   ```

3. **Authorization & Subscriptions** (24-27)
   ```sql
   24_authorization_schema.sql
   25_subscription_plans.sql       -- ✅ REQUIRED for images
   26_exempt_admins_from_limits.sql
   27_add_image_files_support.sql  -- ✅ REQUIRED for images
   ```

4. **Stripe & Advanced Features** (28-30)
   ```sql
   28_stripe_integration.sql
   29_add_stripe_fields_to_subscription_query.sql
   30_scheduled_plan_changes.sql
   ```

5. **Image Support** (31)
   ```sql
   31_image_support.sql            -- ✅ Run this last
   ```

### If You Already Have Multimedia

If you already have the `multimedia_documents` table (check with `\d multimedia_documents`):

1. Check if you have these scripts executed:
   ```sql
   -- Check if table exists
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_name = 'multimedia_documents'
   );
   
   -- Check if max_image_files column exists
   SELECT EXISTS (
     SELECT FROM information_schema.columns 
     WHERE table_name = 'subscription_plans' 
     AND column_name = 'max_image_files'
   );
   ```

2. If table exists but you're missing `max_image_files`:
   ```sql
   27_add_image_files_support.sql  -- Run this first
   31_image_support.sql            -- Then run this
   ```

3. If table doesn't exist:
   ```sql
   19_multimedia_schema.sql        -- Run this first
   20_multimedia_storage.sql       -- Then this
   21_fix_multimedia_rls.sql       -- Then this
   27_add_image_files_support.sql  -- Then this
   31_image_support.sql            -- Finally this
   ```

## Error: "relation multimedia_documents does not exist"

**This means you haven't run script 19 yet.**

### Solution:
1. Open Supabase SQL Editor
2. Execute in this exact order:
   ```sql
   -- Step 1: Create multimedia base schema
   19_multimedia_schema.sql
   
   -- Step 2: Setup storage
   20_multimedia_storage.sql
   
   -- Step 3: Fix RLS policies
   21_fix_multimedia_rls.sql
   
   -- Step 4: (Optional but recommended)
   22_fix_worker_function.sql
   23_update_audio_bucket_mime_types.sql
   
   -- Step 5: Add subscription support for images
   27_add_image_files_support.sql
   
   -- Step 6: Finally, add images support
   31_image_support.sql
   ```

## Verification After Each Script

After running each script, verify it succeeded:

```sql
-- Check if multimedia_documents table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'multimedia_documents'
);

-- Check if audio bucket exists
SELECT * FROM storage.buckets WHERE name = 'audio';

-- Check if max_image_files exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND column_name = 'max_image_files';
```

## Quick Check: What Have I Already Run?

Run this query to see what tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Key tables for image support:
- ✅ `multimedia_documents` (from script 19)
- ✅ `subscription_plans` (from script 25)
- ✅ `user_subscriptions` (from script 25)

## Common Issues

### Issue 1: "relation already exists"
**Solution:** The script has already been run. You can skip it or run the next one.

### Issue 2: "column already exists"
**Solution:** The migration has already been applied. Safe to skip.

### Issue 3: "policy already exists"
**Solution:** Now fixed in 31_image_support.sql with `DROP POLICY IF EXISTS`.

### Issue 4: "function does not exist"
**Solution:** You're missing a previous migration. Check the order above.

## Storage Buckets

After running SQL scripts, you must **manually create** storage buckets in Supabase UI:

1. **audio** bucket (created by script 20)
   - Should already exist if you ran script 20
   - If not, create manually with 100MB limit

2. **images** bucket (required for script 31)
   - **You must create this manually** in Supabase Storage UI
   - Name: `images`
   - Public: `false`
   - File size limit: `10485760` (10MB)
   - MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

## Summary: Image Support Prerequisites

Before running `31_image_support.sql`, ensure:

- [ ] Script 19 executed (multimedia_documents table exists)
- [ ] Script 20 executed (audio bucket exists)
- [ ] Script 21 executed (RLS policies fixed)
- [ ] Script 25 executed (subscription_plans table exists)
- [ ] Script 27 executed (max_image_files column exists)
- [ ] Images bucket created manually in Supabase Storage UI
- [ ] Now you can run script 31

## Need Help?

If you're unsure what's been run:
1. Check existing tables with the query above
2. Look at Supabase Storage for existing buckets
3. Try running scripts in order - they're mostly idempotent
4. Contact support if issues persist

---

**Last Updated:** 2025-11-10

