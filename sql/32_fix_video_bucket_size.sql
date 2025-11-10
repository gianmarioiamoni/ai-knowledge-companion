-- =====================================================
-- Fix Video Bucket Size Limit
-- Increase video bucket limit to 500MB
-- =====================================================

-- Update video bucket size limit
UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB in bytes
WHERE id = 'videos';

-- Verify the update
DO $$
DECLARE
  v_limit BIGINT;
  v_limit_mb NUMERIC;
BEGIN
  SELECT file_size_limit INTO v_limit
  FROM storage.buckets
  WHERE id = 'videos';
  
  v_limit_mb := v_limit::NUMERIC / 1024 / 1024;
  
  RAISE NOTICE '✅ Video bucket updated!';
  RAISE NOTICE '📦 Bucket: videos';
  RAISE NOTICE '💾 Size limit: % bytes (% MB)', v_limit, ROUND(v_limit_mb, 2);
  
  IF v_limit = 524288000 THEN
    RAISE NOTICE '🎉 Limit correctly set to 500MB';
  ELSE
    RAISE WARNING '⚠️  Limit is % MB, expected 500MB', ROUND(v_limit_mb, 2);
  END IF;
END $$;

-- Show current configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  ROUND(file_size_limit::NUMERIC / 1024 / 1024, 2) as limit_mb,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('audio', 'videos', 'images')
ORDER BY id;

