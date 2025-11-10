-- Migration: Add Stripe fields to get_user_subscription function
-- This update includes stripe_subscription_id and stripe_price_id in the return type

-- Drop the function first to allow changing return type
DROP FUNCTION IF EXISTS get_user_subscription(UUID);

-- Recreate function with Stripe fields
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
  days_remaining INTEGER,
  stripe_subscription_id VARCHAR,
  stripe_price_id VARCHAR
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
  
  -- For normal users, return subscription info with Stripe fields
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
    GREATEST(0, EXTRACT(DAY FROM us.end_date - NOW())::INTEGER) as days_remaining,
    us.stripe_subscription_id,
    us.stripe_price_id
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

