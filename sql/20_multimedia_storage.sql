-- =====================================================
-- Multimedia Storage Setup
-- Create separate buckets for audio, video, and images
-- =====================================================

-- =====================================================
-- 1. Create Multimedia Buckets
-- =====================================================

-- Audio bucket (up to 100MB files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  false,
  104857600, -- 100MB in bytes
  ARRAY[
    'audio/mpeg',      -- MP3
    'audio/wav',       -- WAV
    'audio/mp4',       -- M4A
    'audio/ogg',       -- OGG
    'audio/webm',      -- WebM Audio
    'audio/aac'        -- AAC
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/ogg',
    'audio/webm',
    'audio/aac'
  ];

-- Video bucket (up to 500MB files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  524288000, -- 500MB in bytes
  ARRAY[
    'video/mp4',         -- MP4
    'video/quicktime',   -- MOV
    'video/x-msvideo',   -- AVI
    'video/webm'         -- WebM
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY[
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

-- Images bucket (up to 20MB files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false,
  20971520, -- 20MB in bytes
  ARRAY[
    'image/jpeg',  -- JPG/JPEG
    'image/png',   -- PNG
    'image/gif',   -- GIF
    'image/webp'   -- WebP
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

-- =====================================================
-- 2. Storage Policies - Audio Bucket
-- =====================================================

-- Users can upload audio to their own folder
CREATE POLICY "Users can upload audio to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own audio files
CREATE POLICY "Users can read own audio"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own audio files
CREATE POLICY "Users can update own audio"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own audio files
CREATE POLICY "Users can delete own audio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 3. Storage Policies - Video Bucket
-- =====================================================

-- Users can upload videos to their own folder
CREATE POLICY "Users can upload videos to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own videos
CREATE POLICY "Users can read own videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own videos
CREATE POLICY "Users can update own videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 4. Storage Policies - Images Bucket
-- =====================================================

-- Users can upload images to their own folder
CREATE POLICY "Users can upload images to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own images
CREATE POLICY "Users can read own images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own images
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 5. Public Access Policies (for shared content)
-- =====================================================

-- Allow public read for marketplace tutors' media (if needed in future)
-- Commented out for now, enable when implementing public sharing

-- CREATE POLICY "Public can read public audio"
--   ON storage.objects
--   FOR SELECT
--   TO public
--   USING (
--     bucket_id = 'audio' AND
--     EXISTS (
--       SELECT 1 FROM documents d
--       WHERE d.storage_path = name
--         AND d.media_type = 'audio'
--         AND d.visibility = 'public'
--     )
--   );

-- CREATE POLICY "Public can read public videos"
--   ON storage.objects
--   FOR SELECT
--   TO public
--   USING (
--     bucket_id = 'videos' AND
--     EXISTS (
--       SELECT 1 FROM documents d
--       WHERE d.storage_path = name
--         AND d.media_type = 'video'
--         AND d.visibility = 'public'
--     )
--   );

-- CREATE POLICY "Public can read public images"
--   ON storage.objects
--   FOR SELECT
--   TO public
--   USING (
--     bucket_id = 'images' AND
--     EXISTS (
--       SELECT 1 FROM documents d
--       WHERE d.storage_path = name
--         AND d.media_type = 'image'
--         AND d.visibility = 'public'
--     )
--   );

-- =====================================================
-- 6. Verify Buckets Creation
-- =====================================================

DO $$
DECLARE
  audio_exists BOOLEAN;
  videos_exists BOOLEAN;
  images_exists BOOLEAN;
BEGIN
  -- Check if buckets exist
  SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'audio') INTO audio_exists;
  SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos') INTO videos_exists;
  SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') INTO images_exists;
  
  IF audio_exists AND videos_exists AND images_exists THEN
    RAISE NOTICE '✅ All multimedia buckets created successfully!';
    RAISE NOTICE '🎵 Audio bucket: 100MB limit, 6 formats';
    RAISE NOTICE '🎥 Videos bucket: 500MB limit, 4 formats';
    RAISE NOTICE '🖼️  Images bucket: 20MB limit, 4 formats';
    RAISE NOTICE '🔒 RLS policies enabled for all buckets';
  ELSE
    RAISE WARNING '⚠️  Some buckets may not have been created. Please check manually.';
  END IF;
END $$;

-- =====================================================
-- 7. Helper Function - Get Bucket for Media Type
-- =====================================================

CREATE OR REPLACE FUNCTION get_storage_bucket_for_media_type(p_media_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE p_media_type
    WHEN 'audio' THEN 'audio'
    WHEN 'video' THEN 'videos'
    WHEN 'image' THEN 'images'
    ELSE 'documents' -- Fallback to documents bucket
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_storage_bucket_for_media_type IS
  'Returns the appropriate storage bucket name for a given media type';

-- =====================================================
-- 8. Helper Function - Get Max File Size for Media Type
-- =====================================================

CREATE OR REPLACE FUNCTION get_max_file_size_for_media_type(p_media_type TEXT)
RETURNS BIGINT AS $$
BEGIN
  RETURN CASE p_media_type
    WHEN 'audio' THEN 104857600   -- 100MB
    WHEN 'video' THEN 524288000   -- 500MB
    WHEN 'image' THEN 20971520    -- 20MB
    ELSE 10485760                  -- 10MB for documents
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_max_file_size_for_media_type IS
  'Returns the maximum allowed file size in bytes for a given media type';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Multimedia Storage Setup Complete!';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Buckets Created:';
  RAISE NOTICE '   • audio   (100MB limit)';
  RAISE NOTICE '   • videos  (500MB limit)';
  RAISE NOTICE '   • images  (20MB limit)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '   • RLS policies enabled';
  RAISE NOTICE '   • User-specific folder access';
  RAISE NOTICE '   • MIME type validation';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Helper Functions:';
  RAISE NOTICE '   • get_storage_bucket_for_media_type()';
  RAISE NOTICE '   • get_max_file_size_for_media_type()';
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;

