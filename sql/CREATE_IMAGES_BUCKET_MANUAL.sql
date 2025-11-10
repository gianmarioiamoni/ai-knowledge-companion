-- =====================================================
-- MANUAL BUCKET CREATION (if automatic creation failed)
-- =====================================================

-- This script creates the images bucket if it doesn't exist
-- Run this in Supabase SQL Editor

-- 1. Check if bucket exists
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  CASE 
    WHEN id IS NOT NULL THEN '✅ Bucket exists'
    ELSE '❌ Bucket does not exist'
  END as status
FROM storage.buckets
WHERE id = 'images';

-- 2. Create images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false, -- Private bucket
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Verify bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  '✅ Bucket ready!' as status
FROM storage.buckets
WHERE id = 'images';

-- 4. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Drop and recreate storage policies for images
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Policy: View own images
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Upload own images
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Update own images
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Delete own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Verify all policies are in place
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%image%'
ORDER BY policyname;

-- 7. Final verification
DO $$
BEGIN
  RAISE NOTICE '✅ Images bucket setup complete!';
  RAISE NOTICE 'Bucket: images';
  RAISE NOTICE 'Max size: 10MB';
  RAISE NOTICE 'Formats: JPG, PNG, GIF, WebP';
  RAISE NOTICE 'Policies: SELECT, INSERT, UPDATE, DELETE';
END $$;

