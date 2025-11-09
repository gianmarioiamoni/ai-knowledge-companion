/**
 * Add Image Files Support to Subscription Plans
 * Adds max_image_files column and updates plans with appropriate limits
 */

-- 1. Add max_image_files column to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS max_image_files INTEGER NOT NULL DEFAULT 0;

-- 2. Update existing plans with image limits
UPDATE subscription_plans
SET max_image_files = CASE name
  WHEN 'trial' THEN 5          -- Trial: 5 images
  WHEN 'pro' THEN 50            -- Pro: 50 images
  WHEN 'enterprise' THEN 200    -- Enterprise: 200 images
  ELSE 0
END,
updated_at = NOW();

-- 3. Drop and recreate get_user_subscription function to include max_image_files
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

-- 4. Drop and recreate check_usage_limit function to support 'image' resource type
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
    RETURN QUERY SELECT true, 0, -1, 'Unlimited (Admin)';
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
    RETURN QUERY SELECT false, 0, 0, 'No active subscription found';
    RETURN;
  END IF;
  
  -- Check if unlimited (-1)
  IF v_max_allowed = -1 THEN
    RETURN QUERY SELECT true, 0, -1, 'Unlimited';
    RETURN;
  END IF;
  
  -- Get current usage count
  v_current_count := CASE p_resource_type
    WHEN 'tutors' THEN (
      SELECT COUNT(*) FROM tutors WHERE owner_id = p_user_id
    )
    WHEN 'documents' THEN (
      SELECT COUNT(*) FROM documents WHERE owner_id = p_user_id AND media_type IS NULL
    )
    WHEN 'audio' THEN (
      SELECT COUNT(*) FROM documents WHERE owner_id = p_user_id AND media_type = 'audio'
    )
    WHEN 'video' THEN (
      SELECT COUNT(*) FROM documents WHERE owner_id = p_user_id AND media_type = 'video'
    )
    WHEN 'image' THEN (
      SELECT COUNT(*) FROM documents WHERE owner_id = p_user_id AND media_type = 'image'
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

-- 5. Verify the changes
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

