-- =====================================================
-- FIX: Image Support Complete Setup
-- This script ensures all components for image support are properly configured
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create images storage bucket (if not exists)
-- Note: This might need to be done in Supabase Dashboard -> Storage if SQL doesn't work
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- STEP 2: Add max_image_files column to subscription_plans (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscription_plans'
      AND column_name = 'max_image_files'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD COLUMN max_image_files INTEGER NOT NULL DEFAULT 0;
    
    RAISE NOTICE '✅ Added max_image_files column to subscription_plans';
  ELSE
    RAISE NOTICE 'ℹ️  max_image_files column already exists';
  END IF;
END $$;

-- STEP 3: Update existing plans with image limits
UPDATE subscription_plans
SET 
  max_image_files = CASE name
    WHEN 'trial' THEN 5          -- Trial: 5 images
    WHEN 'pro' THEN 50            -- Pro: 50 images
    WHEN 'enterprise' THEN 200    -- Enterprise: 200 images
    ELSE 0
  END,
  updated_at = NOW()
WHERE max_image_files = 0 OR max_image_files IS NULL;

-- STEP 4: Drop and recreate check_usage_limit function with image support
DROP FUNCTION IF EXISTS check_usage_limit(UUID, VARCHAR);

CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_resource_type VARCHAR -- 'tutors', 'documents', 'audio', 'video', 'image'
)
RETURNS TABLE (
  can_create BOOLEAN,
  current_count INTEGER,
  max_allowed INTEGER,
  message TEXT
) AS $$
DECLARE
  v_max_allowed INTEGER;
  v_current_count INTEGER;
  v_can_create BOOLEAN;
  v_message TEXT;
  v_user_role VARCHAR;
BEGIN
  -- Check if user is admin or super_admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = p_user_id;
  
  -- Admins have unlimited access
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN QUERY SELECT true, 0, -1, 'Unlimited (Admin)'::TEXT;
    RETURN;
  END IF;
  
  -- For normal users, check subscription limits
  -- Get user's plan limits
  SELECT 
    CASE p_resource_type
      WHEN 'tutors' THEN sp.max_tutors
      WHEN 'documents' THEN sp.max_documents
      WHEN 'audio' THEN sp.max_audio_files
      WHEN 'video' THEN sp.max_video_files
      WHEN 'image' THEN sp.max_image_files
      ELSE 0
    END INTO v_max_allowed
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trial')
  LIMIT 1;
  
  -- If no active subscription, return false
  IF v_max_allowed IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'No active subscription found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if unlimited (-1)
  IF v_max_allowed = -1 THEN
    RETURN QUERY SELECT true, 0, -1, 'Unlimited'::TEXT;
    RETURN;
  END IF;
  
  -- Get current usage count
  v_current_count := CASE p_resource_type
    WHEN 'tutors' THEN (
      SELECT COUNT(*)::INTEGER FROM tutors WHERE owner_id = p_user_id
    )
    WHEN 'documents' THEN (
      SELECT COUNT(*)::INTEGER FROM documents 
      WHERE owner_id = p_user_id 
        AND (media_type IS NULL OR media_type = 'document')
    )
    WHEN 'audio' THEN (
      SELECT COUNT(*)::INTEGER FROM documents 
      WHERE owner_id = p_user_id AND media_type = 'audio'
    )
    WHEN 'video' THEN (
      SELECT COUNT(*)::INTEGER FROM documents 
      WHERE owner_id = p_user_id AND media_type = 'video'
    )
    WHEN 'image' THEN (
      SELECT COUNT(*)::INTEGER FROM documents 
      WHERE owner_id = p_user_id AND media_type = 'image'
    )
    ELSE 0
  END;
  
  -- Check if can create
  v_can_create := v_current_count < v_max_allowed;
  
  IF v_can_create THEN
    v_message := format('You can create %s more %s', v_max_allowed - v_current_count, p_resource_type);
  ELSE
    v_message := format('You have reached your plan limit of %s %s', v_max_allowed, p_resource_type);
  END IF;
  
  RETURN QUERY SELECT v_can_create, v_current_count, v_max_allowed, v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Drop and recreate get_user_subscription function to include max_image_files
DROP FUNCTION IF EXISTS get_user_subscription(UUID);

CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  user_id UUID,
  plan_id UUID,
  plan_name VARCHAR,
  plan_display_name VARCHAR,
  plan_description TEXT,
  price_monthly DECIMAL,
  price_yearly DECIMAL,
  max_tutors INTEGER,
  max_documents INTEGER,
  max_audio_files INTEGER,
  max_video_files INTEGER,
  max_image_files INTEGER,
  status VARCHAR,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  billing_cycle VARCHAR,
  days_remaining INTEGER
) AS $$
DECLARE
  v_user_role VARCHAR;
BEGIN
  -- Check if user is admin or super_admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = p_user_id;
  
  -- Admins don't have subscriptions (unlimited access)
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN;
  END IF;
  
  -- For normal users, return subscription info
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    sp.name,
    sp.display_name,
    sp.description,
    sp.price_monthly,
    sp.price_yearly,
    sp.max_tutors,
    sp.max_documents,
    sp.max_audio_files,
    sp.max_video_files,
    sp.max_image_files,
    us.status,
    us.start_date,
    us.end_date,
    us.trial_end_date,
    us.billing_cycle,
    GREATEST(0, EXTRACT(DAY FROM us.end_date - NOW())::INTEGER) as days_remaining
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Storage policies for images bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Create policies for images bucket
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- STEP 7: Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Image support configuration complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Verification:';
  RAISE NOTICE '1. max_image_files column added to subscription_plans';
  RAISE NOTICE '2. Plans updated with image limits';
  RAISE NOTICE '3. check_usage_limit function updated to support "image" type';
  RAISE NOTICE '4. get_user_subscription function updated';
  RAISE NOTICE '5. Storage policies created for images bucket';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test with: SELECT * FROM check_usage_limit(auth.uid(), ''image'');';
END $$;

-- Display current plan limits
SELECT 
  name,
  display_name,
  max_tutors,
  max_documents,
  max_audio_files,
  max_video_files,
  max_image_files
FROM subscription_plans
ORDER BY sort_order;

