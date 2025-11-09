/**
 * Update Subscription System - Exempt Admins from Usage Limits
 * Admins (super_admin and admin) get unlimited access without subscription restrictions
 */

-- 1. Update check_usage_limit function to bypass limits for admins
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_resource_type VARCHAR -- 'tutors', 'documents', 'audio', 'video'
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

-- 2. Update get_user_subscription function to return NULL for admins
-- (since they don't need a subscription)
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

-- 3. Update assign_trial_plan function to skip admins
CREATE OR REPLACE FUNCTION assign_trial_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_trial_plan_id UUID;
  v_user_role VARCHAR;
BEGIN
  -- Check if user is admin or super_admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = NEW.id;
  
  -- Skip trial assignment for admins
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN NEW;
  END IF;
  
  -- Get trial plan ID
  SELECT id INTO v_trial_plan_id
  FROM subscription_plans
  WHERE name = 'trial'
  LIMIT 1;
  
  -- Assign trial plan to new user
  IF v_trial_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      trial_end_date
    ) VALUES (
      NEW.id,
      v_trial_plan_id,
      'trial',
      NOW(),
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

