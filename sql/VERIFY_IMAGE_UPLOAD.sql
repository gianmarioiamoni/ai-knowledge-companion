-- Deep Verification Script for Image Upload
-- Run this to identify the exact issue

-- 1. Verify images bucket exists
SELECT 
  'BUCKET CHECK' as test_name,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'images';

-- 2. Verify storage policies for images
SELECT 
  'STORAGE POLICIES' as test_name,
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_check,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (policyname LIKE '%image%' OR policyname LIKE '%Images%');

-- 3. Check current user subscription
SELECT 
  'USER SUBSCRIPTION' as test_name,
  us.id as subscription_id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.max_image_files,
  us.start_date,
  us.end_date,
  CASE 
    WHEN us.end_date > NOW() THEN 'Active'
    ELSE 'Expired'
  END as subscription_status
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = auth.uid();

-- 4. Test check_usage_limit function for current user
SELECT 
  'USAGE LIMIT CHECK' as test_name,
  *
FROM check_usage_limit(auth.uid(), 'image');

-- 5. Check current user's profile and role
SELECT 
  'USER PROFILE' as test_name,
  p.id,
  au.email,
  p.role
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.id = auth.uid();

-- 6. Verify check_usage_limit function signature
SELECT 
  'FUNCTION CHECK' as test_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'check_usage_limit';

-- 7. Check if user has any active subscription (including trial)
SELECT 
  'ACTIVE SUBSCRIPTION CHECK' as test_name,
  COUNT(*) as active_subscription_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ User has active subscription'
    ELSE '❌ No active subscription found'
  END as status
FROM user_subscriptions
WHERE user_id = auth.uid()
  AND status IN ('active', 'trial')
  AND end_date > NOW();

-- 8. List all storage policies to see if there are conflicts
SELECT 
  'ALL STORAGE POLICIES' as test_name,
  policyname,
  cmd as operation,
  SUBSTRING(qual FROM 1 FOR 50) as using_clause_preview
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

