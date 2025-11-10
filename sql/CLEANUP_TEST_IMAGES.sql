-- =====================================================
-- Cleanup Test Images
-- Removes the 1x1 pixel test image created during debugging
-- =====================================================

-- 1. Find test images (very small file size, typically 70 bytes)
SELECT 
  '1️⃣ TEST IMAGES FOUND' as step,
  id,
  title,
  storage_path,
  file_size,
  media_type,
  created_at
FROM documents
WHERE media_type = 'image'
  AND file_size < 1000  -- Less than 1KB = likely test image
ORDER BY created_at DESC;

-- 2. Delete test images from documents table
-- This will cascade delete related chunks and queue entries
DELETE FROM documents
WHERE media_type = 'image'
  AND file_size < 1000;  -- Less than 1KB

-- 3. Verify cleanup
SELECT 
  '2️⃣ REMAINING IMAGES' as step,
  id,
  title,
  file_size,
  media_type,
  created_at
FROM documents
WHERE media_type = 'image'
ORDER BY created_at DESC;

-- 4. Note about storage cleanup
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE CLEANUP COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Storage cleanup';
  RAISE NOTICE '   The test image file still exists in Storage.';
  RAISE NOTICE '   To remove it completely:';
  RAISE NOTICE '';
  RAISE NOTICE '   1. Go to Supabase Dashboard';
  RAISE NOTICE '   2. Storage → images bucket';
  RAISE NOTICE '   3. Navigate to your user folder';
  RAISE NOTICE '   4. Delete files smaller than 1KB';
  RAISE NOTICE '';
  RAISE NOTICE '   OR use the DELETE button in the UI';
  RAISE NOTICE '';
END $$;

