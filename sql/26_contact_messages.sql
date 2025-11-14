-- =====================================================
-- Contact Messages Table
-- Stores contact form submissions from users
-- =====================================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS public.contact_messages CASCADE;

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Message details
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'support', 'bug', 'feature', 'billing', 'other')),
  message TEXT NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  is_authenticated BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT,
  ip_address INET,
  
  -- Response tracking
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_category ON public.contact_messages(category);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_priority ON public.contact_messages(priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins and super admins can view all messages
CREATE POLICY "Admins can view all contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update message status and responses
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete messages
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get contact message statistics
CREATE OR REPLACE FUNCTION get_contact_message_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed'),
    'by_category', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM public.contact_messages
        GROUP BY category
      ) category_counts
    ),
    'by_priority', (
      SELECT json_object_agg(priority, count)
      FROM (
        SELECT priority, COUNT(*) as count
        FROM public.contact_messages
        GROUP BY priority
      ) priority_counts
    ),
    'avg_response_time_hours', (
      SELECT EXTRACT(EPOCH FROM AVG(responded_at - created_at)) / 3600
      FROM public.contact_messages
      WHERE responded_at IS NOT NULL
    ),
    'last_24h', COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours')
  ) INTO result
  FROM public.contact_messages;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_contact_message_stats() TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.contact_messages IS 'Stores contact form submissions from authenticated and guest users';
COMMENT ON COLUMN public.contact_messages.user_id IS 'Reference to the user if authenticated, NULL for guest submissions';
COMMENT ON COLUMN public.contact_messages.status IS 'Current status of the message: pending, in_progress, resolved, closed';
COMMENT ON COLUMN public.contact_messages.priority IS 'Priority level assigned by admins';
COMMENT ON COLUMN public.contact_messages.is_authenticated IS 'Whether the user was authenticated when submitting';
COMMENT ON COLUMN public.contact_messages.responded_at IS 'Timestamp when admin responded to the message';
COMMENT ON COLUMN public.contact_messages.responded_by IS 'Admin user who responded to the message';

-- =====================================================
-- Migration Complete
-- =====================================================
-- This migration creates the contact_messages table with:
-- - User and message information
-- - Status tracking and priority
-- - Response tracking
-- - RLS policies for security
-- - Helper functions for statistics
-- - Proper indexing for performance

