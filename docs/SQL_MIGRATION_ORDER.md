# SQL Migration Scripts - Execution Order

## ⚠️ IMPORTANT: Execute Scripts in Order

The SQL migration scripts must be executed **in numerical order** to avoid dependency errors.

## ✅ How the Multimedia System Works

The multimedia system **extends the existing `documents` table** rather than creating a separate table:
- The `documents` table has `media_type` column ('document', 'audio', 'video', 'image')
- Audio files are stored in the `audio` bucket
- Image files are stored in the `images` bucket
- Processing metadata is stored in `media_processing_queue` table
- Tutor associations are stored in `tutor_multimedia` table

## Prerequisites for Image Support

Before running `31_image_support.sql`, you **must** have executed these scripts:

### 1. Multimedia Base Schema (REQUIRED)
```sql
19_multimedia_schema.sql       -- Extends documents table with media_type, adds media_processing_queue
20_multimedia_storage.sql      -- Creates audio bucket and storage policies
21_fix_multimedia_rls.sql      -- Fixes RLS policies for multimedia
```

### 2. Subscription Plans (REQUIRED)
```sql
25_subscription_plans.sql      -- Creates subscription system
27_add_image_files_support.sql -- Adds max_image_files to plans
```

### 3. Image Support (FINAL)
```sql
31_image_support.sql           -- Adds images bucket, policies, and indexes
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

### If You Already Have Audio Working

If you already have audio files working (script 19-21 already executed):

1. Check what you have:
   ```sql
   -- Check if documents table has media_type column
   SELECT EXISTS (
     SELECT FROM information_schema.columns 
     WHERE table_name = 'documents' 
     AND column_name = 'media_type'
   );
   
   -- Check if audio bucket exists
   SELECT * FROM storage.buckets WHERE name = 'audio';
   
   -- Check if max_image_files column exists
   SELECT EXISTS (
     SELECT FROM information_schema.columns 
     WHERE table_name = 'subscription_plans' 
     AND column_name = 'max_image_files'
   );
   ```

2. If you have audio working but not image limits:
   ```sql
   27_add_image_files_support.sql  -- Run this first
   31_image_support.sql            -- Then run this
   ```

3. If documents table doesn't have media_type:
   ```sql
   19_multimedia_schema.sql        -- Run this first
   20_multimedia_storage.sql       -- Then this
   21_fix_multimedia_rls.sql       -- Then this
   27_add_image_files_support.sql  -- Then this
   31_image_support.sql            -- Finally this
   ```

## Common Errors

### Error: "relation multimedia_documents does not exist"

**This error means the script is looking for the wrong table.**

**Context:** There is NO `multimedia_documents` table. The system uses the existing `documents` table with a `media_type` column.

**Solution:**
- ✅ Script 31 has been fixed to use `documents` table
- ✅ Make sure you're running the latest version of `31_image_support.sql`

If you still see this error:
1. Check which script is throwing it
2. Verify the script references `documents` table, not `multimedia_documents`
3. Run script 19 if `media_type` column doesn't exist in `documents`

### Error: "column media_type does not exist"

**This means you haven't run script 19 yet.**

**Solution:**
Execute these scripts in order:
```sql
19_multimedia_schema.sql        -- Adds media_type to documents table
20_multimedia_storage.sql       -- Creates audio bucket
21_fix_multimedia_rls.sql       -- Fixes RLS
27_add_image_files_support.sql  -- Adds image limits
31_image_support.sql            -- Adds image support
```

## Verification After Each Script

After running each script, verify it succeeded:

```sql
-- Check if documents table has media_type column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'media_type';

-- Check storage buckets
SELECT name, public, file_size_limit 
FROM storage.buckets 
WHERE name IN ('audio', 'images');

-- Check if max_image_files exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND column_name = 'max_image_files';

-- Check if media_processing_queue exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'media_processing_queue'
);
```

## Quick Check: What Have I Already Run?

Run this query to see what multimedia support exists:

```sql
-- Check documents table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents'
AND column_name IN ('media_type', 'duration_seconds', 'transcription_status', 'width', 'height')
ORDER BY column_name;

-- Check storage buckets
SELECT name FROM storage.buckets ORDER BY name;

-- Check multimedia tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('media_processing_queue', 'tutor_multimedia', 'subscription_plans')
ORDER BY table_name;
```

Key components for image support:
- ✅ `documents` table with `media_type` column (from script 19)
- ✅ `media_processing_queue` table (from script 19)
- ✅ `audio` bucket (from script 20)
- ✅ `images` bucket (from script 31 + manual creation)
- ✅ `subscription_plans.max_image_files` column (from script 27)

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

- [ ] Script 19 executed (`documents` table has `media_type` column)
- [ ] Script 20 executed (`audio` bucket exists)
- [ ] Script 21 executed (RLS policies fixed)
- [ ] Script 25 executed (`subscription_plans` table exists)
- [ ] Script 27 executed (`max_image_files` column exists in `subscription_plans`)
- [ ] `images` bucket created manually in Supabase Storage UI
- [ ] Now you can run script 31 safely

## Need Help?

If you're unsure what's been run:
1. Check existing tables with the query above
2. Look at Supabase Storage for existing buckets
3. Try running scripts in order - they're mostly idempotent
4. Contact support if issues persist

---

**Last Updated:** 2025-11-10

