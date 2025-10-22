-- Check if documents bucket exists
SELECT * FROM storage.buckets WHERE name = 'documents';

-- Check bucket policies
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%documents%';

-- Check all storage policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- Check current user role
SELECT current_user, session_user;

-- Check auth context
SELECT auth.role(), auth.uid();
