-- Diagnostic Script: Check Image Support Setup
-- Run this in Supabase SQL Editor to verify image support is properly configured

-- 1. Check if max_image_files column exists in subscription_plans
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscription_plans'
  AND column_name = 'max_image_files';

-- 2. Check current values in subscription_plans
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

-- 3. Check if check_usage_limit function exists and its signature
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'check_usage_limit';

-- 4. Test check_usage_limit with 'image' resource type
-- Replace 'YOUR_USER_ID' with an actual user ID from your database
-- SELECT * FROM check_usage_limit('YOUR_USER_ID'::UUID, 'image');

-- 5. Check if images bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'images';

-- 6. Check storage policies for images bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%image%';

-- 7. Check if there are any documents with media_type = 'image'
SELECT 
  COUNT(*) as image_count,
  COUNT(DISTINCT owner_id) as unique_users
FROM documents
WHERE media_type = 'image';

