/**
 * Subscription Plans Schema
 * Creates tables for managing subscription plans and user subscriptions
 */

-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Usage limits
  max_tutors INTEGER NOT NULL DEFAULT 1,
  max_documents INTEGER NOT NULL DEFAULT 3,
  max_audio_files INTEGER NOT NULL DEFAULT 1,
  max_video_files INTEGER NOT NULL DEFAULT 0,
  
  -- Features
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Subscription status
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, expired, trial
  
  -- Dates
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  trial_end_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Billing
  billing_cycle VARCHAR(20), -- monthly, yearly, null for trial
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 3. Insert default plans
INSERT INTO subscription_plans (
  name, 
  display_name, 
  description, 
  price_monthly, 
  price_yearly,
  max_tutors,
  max_documents,
  max_audio_files,
  max_video_files,
  trial_days,
  sort_order
) VALUES 
  (
    'trial',
    'Trial',
    'Try AI Knowledge Companion free for 30 days',
    0,
    0,
    1,
    3,
    1,
    0,
    30,
    1
  ),
  (
    'pro',
    'Pro',
    'Perfect for individuals and small teams',
    19.00,
    190.00,
    10,
    50,
    20,
    0,
    0,
    2
  ),
  (
    'enterprise',
    'Enterprise',
    'For power users and organizations',
    49.00,
    490.00,
    -1, -- -1 means unlimited
    500,
    100,
    50,
    0,
    3
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_tutors = EXCLUDED.max_tutors,
  max_documents = EXCLUDED.max_documents,
  max_audio_files = EXCLUDED.max_audio_files,
  max_video_files = EXCLUDED.max_video_files,
  trial_days = EXCLUDED.trial_days,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. Function to auto-assign trial plan to new users
CREATE OR REPLACE FUNCTION assign_trial_plan()
RETURNS TRIGGER AS $$
DECLARE
  trial_plan_id UUID;
  trial_duration INTEGER;
BEGIN
  -- Get trial plan ID and duration
  SELECT id, trial_days INTO trial_plan_id, trial_duration
  FROM subscription_plans
  WHERE name = 'trial'
  LIMIT 1;
  
  -- Create trial subscription for new user
  IF trial_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      trial_end_date
    ) VALUES (
      NEW.id,
      trial_plan_id,
      'trial',
      NOW(),
      NOW() + INTERVAL '1 day' * trial_duration,
      NOW() + INTERVAL '1 day' * trial_duration
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger to assign trial plan on user creation
DROP TRIGGER IF EXISTS assign_trial_plan_trigger ON auth.users;
CREATE TRIGGER assign_trial_plan_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_trial_plan();

-- 6. Function to check if subscription is expired
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void AS $$
BEGIN
  -- Update expired subscriptions
  UPDATE user_subscriptions
  SET status = 'expired',
      updated_at = NOW()
  WHERE status IN ('active', 'trial')
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to get user subscription with plan details
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
BEGIN
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

-- 8. Function to check user usage limits
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
BEGIN
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

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

-- 10. Enable RLS on tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (everyone can read active plans)
CREATE POLICY "Everyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view and manage all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 11. Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Grant permissions
GRANT SELECT ON subscription_plans TO authenticated, anon;
GRANT SELECT, UPDATE ON user_subscriptions TO authenticated;

