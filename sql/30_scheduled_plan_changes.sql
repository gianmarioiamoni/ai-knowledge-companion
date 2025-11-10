-- Migration: Add support for scheduled plan changes
-- This allows tracking when a user has scheduled a downgrade/upgrade at period end

-- Add fields to user_subscriptions table for scheduled changes
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS scheduled_plan_id UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS scheduled_billing_cycle VARCHAR(10) CHECK (scheduled_billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS scheduled_change_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_price_id VARCHAR(255);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_scheduled_plan 
ON user_subscriptions(scheduled_plan_id) 
WHERE scheduled_plan_id IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN user_subscriptions.scheduled_plan_id IS 'Plan that will become active at the end of current billing period';
COMMENT ON COLUMN user_subscriptions.scheduled_billing_cycle IS 'Billing cycle for the scheduled plan';
COMMENT ON COLUMN user_subscriptions.scheduled_change_date IS 'When the scheduled plan change will take effect';
COMMENT ON COLUMN user_subscriptions.scheduled_price_id IS 'Stripe price ID for the scheduled plan';

-- Update get_user_subscription to include scheduled plan info
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
  days_remaining INTEGER,
  stripe_subscription_id VARCHAR,
  stripe_price_id VARCHAR,
  -- Scheduled plan fields
  scheduled_plan_id UUID,
  scheduled_plan_name VARCHAR,
  scheduled_plan_display_name VARCHAR,
  scheduled_billing_cycle VARCHAR,
  scheduled_change_date TIMESTAMPTZ
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
  
  -- For normal users, return subscription info with Stripe fields and scheduled changes
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
    us.stripe_price_id,
    -- Scheduled plan info (if exists)
    us.scheduled_plan_id,
    sp_scheduled.name as scheduled_plan_name,
    sp_scheduled.display_name as scheduled_plan_display_name,
    us.scheduled_billing_cycle,
    us.scheduled_change_date
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  LEFT JOIN subscription_plans sp_scheduled ON us.scheduled_plan_id = sp_scheduled.id
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule a plan change
CREATE OR REPLACE FUNCTION schedule_plan_change(
  p_user_id UUID,
  p_new_plan_id UUID,
  p_new_billing_cycle VARCHAR,
  p_change_date TIMESTAMPTZ,
  p_stripe_price_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    scheduled_plan_id = p_new_plan_id,
    scheduled_billing_cycle = p_new_billing_cycle,
    scheduled_change_date = p_change_date,
    scheduled_price_id = p_stripe_price_id,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply scheduled plan change (called by webhook or cron)
CREATE OR REPLACE FUNCTION apply_scheduled_plan_change(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_scheduled_plan_id UUID;
  v_scheduled_billing_cycle VARCHAR;
BEGIN
  -- Get scheduled plan info
  SELECT scheduled_plan_id, scheduled_billing_cycle
  INTO v_scheduled_plan_id, v_scheduled_billing_cycle
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND scheduled_plan_id IS NOT NULL
    AND scheduled_change_date <= NOW();
  
  -- If no scheduled change, return false
  IF v_scheduled_plan_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Apply the scheduled change
  UPDATE user_subscriptions
  SET 
    plan_id = v_scheduled_plan_id,
    billing_cycle = v_scheduled_billing_cycle,
    scheduled_plan_id = NULL,
    scheduled_billing_cycle = NULL,
    scheduled_change_date = NULL,
    scheduled_price_id = NULL,
    start_date = NOW(),
    end_date = CASE 
      WHEN v_scheduled_billing_cycle = 'monthly' THEN NOW() + INTERVAL '1 month'
      WHEN v_scheduled_billing_cycle = 'yearly' THEN NOW() + INTERVAL '1 year'
      ELSE NOW() + INTERVAL '1 month'
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel scheduled plan change
CREATE OR REPLACE FUNCTION cancel_scheduled_plan_change(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    scheduled_plan_id = NULL,
    scheduled_billing_cycle = NULL,
    scheduled_change_date = NULL,
    scheduled_price_id = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND scheduled_plan_id IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

