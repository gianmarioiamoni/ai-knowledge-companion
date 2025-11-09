/**
 * Stripe Integration Schema
 * Adds necessary fields to store Stripe customer and subscription data
 */

-- 1. Add stripe_customer_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);

-- Add comment
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';

-- 2. Add Stripe fields to user_subscriptions table
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_method VARCHAR(50); -- 'card', 'paypal', etc.

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id 
ON user_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_price_id 
ON user_subscriptions(stripe_price_id);

-- Add comments
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN user_subscriptions.stripe_price_id IS 'Stripe price ID for the subscription';
COMMENT ON COLUMN user_subscriptions.stripe_payment_method IS 'Payment method used (card, paypal, etc.)';

-- 3. Add Stripe price IDs to subscription_plans table
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS stripe_monthly_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_yearly_price_id VARCHAR(255);

-- Add comments
COMMENT ON COLUMN subscription_plans.stripe_monthly_price_id IS 'Stripe price ID for monthly billing';
COMMENT ON COLUMN subscription_plans.stripe_yearly_price_id IS 'Stripe price ID for yearly billing';

-- 4. Update plans with Stripe Price IDs (you'll need to replace these with your actual Price IDs)
-- IMPORTANT: Replace these placeholder values with your actual Stripe Price IDs from .env.local

-- Example (REPLACE WITH YOUR ACTUAL IDs):
-- UPDATE subscription_plans
-- SET 
--   stripe_monthly_price_id = 'price_xxxxxxxxxxxxx',
--   stripe_yearly_price_id = 'price_yyyyyyyyyyyyy'
-- WHERE name = 'pro';
-- 
-- UPDATE subscription_plans
-- SET 
--   stripe_monthly_price_id = 'price_zzzzzzzzzzzzz',
--   stripe_yearly_price_id = 'price_wwwwwwwwwwwww'
-- WHERE name = 'enterprise';

-- 5. Create function to get or create Stripe customer ID
CREATE OR REPLACE FUNCTION get_or_create_stripe_customer(
  p_user_id UUID
)
RETURNS VARCHAR AS $$
DECLARE
  v_stripe_customer_id VARCHAR;
BEGIN
  -- Get existing stripe_customer_id
  SELECT stripe_customer_id INTO v_stripe_customer_id
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN v_stripe_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to update stripe customer ID
CREATE OR REPLACE FUNCTION update_stripe_customer_id(
  p_user_id UUID,
  p_stripe_customer_id VARCHAR
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET stripe_customer_id = p_stripe_customer_id
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to create/update subscription from Stripe
CREATE OR REPLACE FUNCTION upsert_subscription_from_stripe(
  p_user_id UUID,
  p_plan_name VARCHAR,
  p_stripe_subscription_id VARCHAR,
  p_stripe_price_id VARCHAR,
  p_billing_cycle VARCHAR, -- 'monthly' or 'yearly'
  p_stripe_payment_method VARCHAR,
  p_status VARCHAR,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_id UUID;
BEGIN
  -- Get plan ID
  SELECT id INTO v_plan_id
  FROM subscription_plans
  WHERE name = p_plan_name;
  
  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan % not found', p_plan_name;
  END IF;
  
  -- Upsert subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    stripe_subscription_id,
    stripe_price_id,
    stripe_payment_method,
    status,
    billing_cycle,
    start_date,
    end_date,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    v_plan_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_stripe_payment_method,
    p_status,
    p_billing_cycle,
    p_start_date,
    p_end_date,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    stripe_payment_method = EXCLUDED.stripe_payment_method,
    status = EXCLUDED.status,
    billing_cycle = EXCLUDED.billing_cycle,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription_from_stripe(
  p_stripe_subscription_id VARCHAR
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE stripe_subscription_id = p_stripe_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to get plan by Stripe price ID
CREATE OR REPLACE FUNCTION get_plan_by_stripe_price_id(
  p_stripe_price_id VARCHAR
)
RETURNS TABLE (
  plan_id UUID,
  plan_name VARCHAR,
  plan_display_name VARCHAR,
  billing_cycle VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.display_name,
    CASE 
      WHEN sp.stripe_monthly_price_id = p_stripe_price_id THEN 'monthly'
      WHEN sp.stripe_yearly_price_id = p_stripe_price_id THEN 'yearly'
      ELSE NULL
    END as billing_cycle
  FROM subscription_plans sp
  WHERE sp.stripe_monthly_price_id = p_stripe_price_id
     OR sp.stripe_yearly_price_id = p_stripe_price_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Verify the schema changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'stripe_customer_id';

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' 
  AND column_name IN ('stripe_subscription_id', 'stripe_price_id', 'stripe_payment_method');

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_plans' 
  AND column_name IN ('stripe_monthly_price_id', 'stripe_yearly_price_id');

