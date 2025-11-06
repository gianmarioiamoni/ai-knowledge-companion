-- =====================================================
-- Fix Multimedia Storage RLS Policies
-- Drop existing conflicting policies and recreate
-- =====================================================

-- =====================================================
-- 1. Drop ALL existing storage policies (clean slate)
-- =====================================================

-- Drop all audio policies
DROP POLICY IF EXISTS "Users can upload audio to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio" ON storage.objects;

-- Drop all video policies
DROP POLICY IF EXISTS "Users can upload videos to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;

-- Drop all image policies
DROP POLICY IF EXISTS "Users can upload images to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Drop any old document policies that might conflict
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- =====================================================
-- 2. Recreate Audio Bucket Policies
-- =====================================================

-- INSERT: Users can upload audio to their own folder
CREATE POLICY "Users can upload audio to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: Users can read their own audio files
CREATE POLICY "Users can read own audio"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Users can update their own audio metadata
CREATE POLICY "Users can update own audio"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Users can delete their own audio files
CREATE POLICY "Users can delete own audio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 3. Recreate Video Bucket Policies
-- =====================================================

-- INSERT: Users can upload videos to their own folder
CREATE POLICY "Users can upload videos to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: Users can read their own videos
CREATE POLICY "Users can read own videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Users can update their own video metadata
CREATE POLICY "Users can update own videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Users can delete their own videos
CREATE POLICY "Users can delete own videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 4. Recreate Image Bucket Policies
-- =====================================================

-- INSERT: Users can upload images to their own folder
CREATE POLICY "Users can upload images to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: Users can read their own images
CREATE POLICY "Users can read own images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Users can update their own image metadata
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 5. Recreate Documents Bucket Policies (if needed)
-- =====================================================

-- INSERT: Users can upload documents to their own folder
CREATE POLICY "Users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: Users can read their own documents
CREATE POLICY "Users can view own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 6. Verify Policies
-- =====================================================

-- Show all storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- Should show:
-- ✅ Users can delete own audio (DELETE, authenticated)
-- ✅ Users can delete own documents (DELETE, authenticated)
-- ✅ Users can delete own images (DELETE, authenticated)
-- ✅ Users can delete own videos (DELETE, authenticated)
-- ✅ Users can read own audio (SELECT, authenticated)
-- ✅ Users can read own images (SELECT, authenticated)
-- ✅ Users can read own videos (SELECT, authenticated)
-- ✅ Users can update own audio (UPDATE, authenticated)
-- ✅ Users can update own documents (UPDATE, authenticated)
-- ✅ Users can update own images (UPDATE, authenticated)
-- ✅ Users can update own videos (UPDATE, authenticated)
-- ✅ Users can upload audio to own folder (INSERT, authenticated)
-- ✅ Users can upload documents (INSERT, authenticated)
-- ✅ Users can upload images to own folder (INSERT, authenticated)
-- ✅ Users can upload videos to own folder (INSERT, authenticated)
-- ✅ Users can view own documents (SELECT, authenticated)

