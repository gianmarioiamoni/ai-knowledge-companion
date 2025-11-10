-- Verifica configurazione bucket videos
SELECT 
  id,
  name,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 as limit_mb,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'videos';
