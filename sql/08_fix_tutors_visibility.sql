-- Fix tutors visibility constraint to include 'marketplace'
-- This updates the CHECK constraint to allow 'marketplace' as a valid value

-- Drop the old constraint
ALTER TABLE tutors 
  DROP CONSTRAINT IF EXISTS tutors_visibility_check;

-- Add the new constraint with 'marketplace' included
ALTER TABLE tutors 
  ADD CONSTRAINT tutors_visibility_check 
  CHECK (visibility IN ('private', 'public', 'marketplace'));

-- Verify the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'tutors'::regclass
  AND conname = 'tutors_visibility_check';

