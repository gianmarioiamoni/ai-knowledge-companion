-- =====================================================
-- Update Audio Bucket MIME Types
-- =====================================================
-- Adds support for alternative M4A and AAC MIME types
-- that different browsers/systems may report
-- =====================================================

-- Update audio bucket to accept all audio MIME types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/mpeg',     -- MP3
  'audio/wav',      -- WAV
  'audio/mp4',      -- M4A (standard)
  'audio/x-m4a',    -- M4A (Safari/macOS)
  'audio/m4a',      -- M4A (alternative)
  'audio/ogg',      -- OGG
  'audio/webm',     -- WebM Audio
  'audio/aac',      -- AAC
  'audio/x-aac'     -- AAC (alternative)
]
WHERE id = 'audio';

-- Verify the update
SELECT 
  id,
  allowed_mime_types,
  array_length(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets 
WHERE id = 'audio';

-- =====================================================
-- Why These MIME Types?
-- =====================================================
-- Different browsers and operating systems report the same
-- file format with different MIME types:
--
-- M4A Files:
--   - Safari/macOS:  audio/x-m4a
--   - Chrome/Win:    audio/mp4
--   - Others:        audio/m4a
--
-- AAC Files:
--   - Standard:      audio/aac
--   - Alternative:   audio/x-aac
--
-- This ensures compatibility across all platforms.
-- =====================================================

