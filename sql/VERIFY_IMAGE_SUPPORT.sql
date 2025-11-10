-- Quick verification script for image support
-- Run this to check if everything is configured correctly

-- 1. Check if max_image_files column exists
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND column_name = 'max_image_files';

-- Expected: 1 row with max_image_files | integer | 0

-- 2. Check current plan limits
SELECT 
  name,
  display_name,
  max_audio_files,
  max_image_files
FROM subscription_plans
ORDER BY sort_order;

-- Expected:
-- trial       | Trial         | (some number) | 5
-- pro         | Professional  | (some number) | 50
-- enterprise  | Enterprise    | (some number) | 200

-- 3. Check if storage bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'images';

-- Expected: 1 row with images bucket info

-- 4. Check storage policies for images
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%image%'
ORDER BY policyname;

-- Expected: 3 policies
-- Users can delete own images | SELECT
-- Users can upload own images | INSERT
-- Users can view own images   | DELETE

-- 5. Check if get_user_images function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'get_user_images'
AND routine_schema = 'public';

-- Expected: 1 row with get_user_images function

-- 6. Test the check_usage_limit function with 'image' type
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- SELECT * FROM check_usage_limit('YOUR_USER_ID'::uuid, 'image');

-- Expected: Returns can_create, current_count, max_allowed, message

-- 7. Check if documents table has required columns
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name IN ('media_type', 'width', 'height')
ORDER BY column_name;

-- Expected: 3 rows (media_type, width, height)

-- 8. Summary check
DO $$
DECLARE
  has_column BOOLEAN;
  has_bucket BOOLEAN;
  has_function BOOLEAN;
  has_policies INTEGER;
BEGIN
  -- Check column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'max_image_files'
  ) INTO has_column;
  
  -- Check bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'images'
  ) INTO has_bucket;
  
  -- Check function
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'get_user_images'
  ) INTO has_function;
  
  -- Count policies
  SELECT COUNT(*) INTO has_policies
  FROM pg_policies
  WHERE tablename = 'objects'
  AND policyname LIKE '%image%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'IMAGE SUPPORT VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'max_image_files column:  %', CASE WHEN has_column THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE 'images bucket:           %', CASE WHEN has_bucket THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE 'get_user_images():       %', CASE WHEN has_function THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE 'Storage policies:        % found (expected: 3)', has_policies;
  RAISE NOTICE '========================================';
  
  IF has_column AND has_bucket AND has_function AND has_policies = 3 THEN
    RAISE NOTICE '✓ All components are in place!';
    RAISE NOTICE 'If you still get 403 errors, check:';
    RAISE NOTICE '  1. Run script 27 if max_image_files = 0 for all plans';
    RAISE NOTICE '  2. User has an active subscription';
    RAISE NOTICE '  3. User has not exceeded image limit';
  ELSE
    RAISE NOTICE '✗ Some components are missing:';
    IF NOT has_column THEN
      RAISE NOTICE '  - Run script 27: sql/27_add_image_files_support.sql';
    END IF;
    IF NOT has_bucket THEN
      RAISE NOTICE '  - Create images bucket in Supabase Storage UI';
    END IF;
    IF NOT has_function THEN
      RAISE NOTICE '  - Run script 31: sql/31_image_support.sql';
    END IF;
    IF has_policies <> 3 THEN
      RAISE NOTICE '  - Run script 31: sql/31_image_support.sql';
    END IF;
  END IF;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

