-- Fix RLS policy for tutors to include 'marketplace' visibility
-- This allows anyone to view tutors with visibility = 'marketplace'

-- Drop the old policy
DROP POLICY IF EXISTS "Users can view own tutors and public tutors" ON tutors;

-- Create updated policy that includes marketplace tutors
CREATE POLICY "Users can view own tutors and public tutors" 
ON tutors
FOR SELECT
USING (
  owner_id = auth.uid() 
  OR visibility = 'public' 
  OR visibility = 'marketplace'  -- NEW: Allow marketplace tutors
  OR (visibility = 'unlisted' AND share_token IS NOT NULL)
);

-- Verify the policy
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'tutors' 
  AND policyname = 'Users can view own tutors and public tutors';

