/* ============================================
   Update Tutor RAG Configuration
   ============================================
   Adjusts similarity_threshold and max_context_chunks
   to more realistic values for production RAG.
   
   Issue: Original threshold of 0.7 was too restrictive.
   Typical similarity scores for related content: 0.3-0.6
*/

/* 1. Check current configuration */
SELECT 
  name,
  similarity_threshold as old_threshold,
  max_context_chunks as old_chunks,
  use_rag
FROM tutors
WHERE owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
ORDER BY name;

/* 2. Update seed tutors with optimized RAG config */
UPDATE tutors
SET 
  similarity_threshold = CASE
    WHEN name = 'Calculus Professor' THEN 0.45          -- Precise (math)
    WHEN name = 'Full-Stack Coding Mentor' THEN 0.45    -- Precise (code)
    WHEN name = 'History Scholar' THEN 0.35             -- Balanced
    WHEN name = 'Biology & Genetics Tutor' THEN 0.40    -- Balanced
    WHEN name = 'English Grammar Expert' THEN 0.35      -- Balanced
    WHEN name = 'General Study Assistant' THEN 0.35     -- General (most permissive)
    ELSE 0.35
  END,
  max_context_chunks = CASE
    WHEN name = 'Calculus Professor' THEN 5             -- Focused
    WHEN name = 'Full-Stack Coding Mentor' THEN 6       -- Slightly more context
    WHEN name = 'History Scholar' THEN 8                -- More context for narrative
    WHEN name = 'Biology & Genetics Tutor' THEN 6       -- Balanced
    WHEN name = 'English Grammar Expert' THEN 7         -- Good examples need context
    WHEN name = 'General Study Assistant' THEN 10       -- Max context for variety
    ELSE 7
  END
WHERE owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89';

/* 3. Verify updated configuration */
SELECT 
  name,
  similarity_threshold as new_threshold,
  max_context_chunks as new_chunks,
  use_rag,
  CASE 
    WHEN name IN ('Calculus Professor', 'Full-Stack Coding Mentor') THEN 'Precise (0.45)'
    WHEN name IN ('Biology & Genetics Tutor') THEN 'Balanced-Precise (0.40)'
    WHEN name IN ('History Scholar', 'English Grammar Expert', 'General Study Assistant') THEN 'Balanced (0.35)'
    ELSE 'Default'
  END as profile
FROM tutors
WHERE owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
ORDER BY name;

/* ============================================
   Expected Results:
   ============================================
   
   Before (too restrictive):
   - similarity_threshold: 0.7 → Only identical chunks pass
   - max_context_chunks: 5 → Limited context
   
   After (optimized):
   - Calculus Professor: 0.45, 5 chunks (precise for math)
   - Full-Stack Coding Mentor: 0.45, 6 chunks (precise for code)
   - Biology & Genetics: 0.40, 6 chunks (balanced)
   - History Scholar: 0.35, 8 chunks (more context for narrative)
   - English Grammar: 0.35, 7 chunks (examples need context)
   - General Study Assistant: 0.35, 10 chunks (max versatility)
   
   Rationale:
   - Similarity 0.3-0.5 captures related content without noise
   - More chunks for subjects needing broader context
   - Fewer chunks for precise subjects (math, code)
*/

