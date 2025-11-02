-- Add sender column to messages table
-- This column distinguishes between 'user' and 'assistant' messages

-- Add the sender column
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender TEXT NOT NULL DEFAULT 'user'
CHECK (sender IN ('user', 'assistant'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON public.messages(sender);

-- Add index for conversation_id + sender combination (common query pattern)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender 
ON public.messages(conversation_id, sender);

-- Update existing messages to have correct sender based on role
-- 'user' role → 'user' sender
-- 'assistant' role → 'assistant' sender
-- 'system' role → 'assistant' sender (system messages are from the AI)
UPDATE public.messages
SET sender = CASE 
  WHEN role = 'user' THEN 'user'
  WHEN role IN ('assistant', 'system') THEN 'assistant'
  ELSE 'user'
END
WHERE sender = 'user'; -- Only update records that still have the default value

-- Verification queries (run these after applying the migration)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'messages'
--   AND column_name = 'sender';

-- SELECT sender, role, COUNT(*) as count
-- FROM public.messages
-- GROUP BY sender, role
-- ORDER BY sender, role;

