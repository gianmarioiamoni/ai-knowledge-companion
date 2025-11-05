-- Billing & Usage Tracking Schema
-- Sprint 4: Billing features

-- Extend usage_logs table with more detailed tracking
ALTER TABLE usage_logs
  ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'api_call',
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create user_quotas table for limits management
CREATE TABLE IF NOT EXISTS user_quotas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Monthly limits
  max_api_calls_per_month INTEGER DEFAULT 1000,
  max_tokens_per_month BIGINT DEFAULT 100000,
  max_cost_per_month DECIMAL(10,2) DEFAULT 10.00,
  
  -- Current usage (reset monthly)
  current_api_calls INTEGER DEFAULT 0,
  current_tokens BIGINT DEFAULT 0,
  current_cost DECIMAL(10,2) DEFAULT 0.00,
  
  -- Reset tracking
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  next_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),
  
  -- Notifications
  notification_threshold_percent INTEGER DEFAULT 80,
  notifications_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage_alerts table for threshold notifications
CREATE TABLE IF NOT EXISTS usage_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('api_calls', 'tokens', 'cost', 'monthly_reset')),
  threshold_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create billing_periods table for monthly aggregates
CREATE TABLE IF NOT EXISTS billing_periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  total_api_calls INTEGER DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  
  breakdown JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);

CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_user_id ON usage_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_unread ON usage_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_billing_periods_user_id ON billing_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_periods_dates ON billing_periods(period_start, period_end);

-- RLS
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_quotas
CREATE POLICY "Users can view own quotas" ON user_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage quotas" ON user_quotas
  FOR ALL USING (true);

-- RLS Policies for usage_alerts
CREATE POLICY "Users can view own alerts" ON usage_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON usage_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service can create alerts" ON usage_alerts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for billing_periods
CREATE POLICY "Users can view own billing periods" ON billing_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage billing periods" ON billing_periods
  FOR ALL USING (true);

-- Function to initialize user quota
CREATE OR REPLACE FUNCTION initialize_user_quota(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_quotas (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to log usage and check quotas
CREATE OR REPLACE FUNCTION log_usage_and_check_quota(
  p_user_id UUID,
  p_tutor_id UUID,
  p_action TEXT,
  p_api_calls INTEGER,
  p_tokens_used INTEGER,
  p_cost_estimate DECIMAL,
  p_metadata JSONB
)
RETURNS TABLE (
  quota_exceeded BOOLEAN,
  exceeded_type TEXT,
  current_value DECIMAL,
  max_value DECIMAL
) AS $$
DECLARE
  v_quota RECORD;
  v_exceeded BOOLEAN := false;
  v_exceeded_type TEXT := NULL;
  v_current DECIMAL;
  v_max DECIMAL;
BEGIN
  -- Initialize quota if not exists
  PERFORM initialize_user_quota(p_user_id);
  
  -- Log usage
  INSERT INTO usage_logs (user_id, tutor_id, action, api_calls, tokens_used, cost_estimate, metadata)
  VALUES (p_user_id, p_tutor_id, p_action, p_api_calls, p_tokens_used, p_cost_estimate, p_metadata);
  
  -- Update current usage
  UPDATE user_quotas
  SET 
    current_api_calls = current_api_calls + p_api_calls,
    current_tokens = current_tokens + p_tokens_used,
    current_cost = current_cost + p_cost_estimate
  WHERE user_id = p_user_id
  RETURNING * INTO v_quota;
  
  -- Check quotas
  IF v_quota.current_api_calls >= v_quota.max_api_calls_per_month THEN
    v_exceeded := true;
    v_exceeded_type := 'api_calls';
    v_current := v_quota.current_api_calls;
    v_max := v_quota.max_api_calls_per_month;
  ELSIF v_quota.current_tokens >= v_quota.max_tokens_per_month THEN
    v_exceeded := true;
    v_exceeded_type := 'tokens';
    v_current := v_quota.current_tokens;
    v_max := v_quota.max_tokens_per_month;
  ELSIF v_quota.current_cost >= v_quota.max_cost_per_month THEN
    v_exceeded := true;
    v_exceeded_type := 'cost';
    v_current := v_quota.current_cost;
    v_max := v_quota.max_cost_per_month;
  END IF;
  
  -- Return result
  RETURN QUERY SELECT v_exceeded, v_exceeded_type, v_current, v_max;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly quotas
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Archive current period
  INSERT INTO billing_periods (user_id, period_start, period_end, total_api_calls, total_tokens, total_cost)
  SELECT 
    user_id,
    last_reset_at,
    NOW(),
    current_api_calls,
    current_tokens,
    current_cost
  FROM user_quotas
  WHERE next_reset_at <= NOW();
  
  -- Reset quotas
  UPDATE user_quotas
  SET 
    current_api_calls = 0,
    current_tokens = 0,
    current_cost = 0.00,
    last_reset_at = NOW(),
    next_reset_at = NOW() + INTERVAL '1 month'
  WHERE next_reset_at <= NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get usage summary for user
CREATE OR REPLACE FUNCTION get_usage_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_api_calls BIGINT,
  total_tokens BIGINT,
  total_cost DECIMAL,
  daily_breakdown JSONB,
  action_breakdown JSONB,
  tutor_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_api_calls,
    COALESCE(SUM(tokens_used), 0)::BIGINT as total_tokens,
    COALESCE(SUM(cost_estimate), 0)::DECIMAL as total_cost,
    (
      SELECT jsonb_object_agg(day, stats)
      FROM (
        SELECT 
          DATE(created_at) as day,
          jsonb_build_object(
            'api_calls', COUNT(*),
            'tokens', COALESCE(SUM(tokens_used), 0),
            'cost', COALESCE(SUM(cost_estimate), 0)
          ) as stats
        FROM usage_logs
        WHERE user_id = p_user_id
          AND created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY DATE(created_at)
        ORDER BY day DESC
      ) daily
    ) as daily_breakdown,
    (
      SELECT jsonb_object_agg(action, count)
      FROM (
        SELECT action, COUNT(*) as count
        FROM usage_logs
        WHERE user_id = p_user_id
          AND created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY action
      ) actions
    ) as action_breakdown,
    (
      SELECT jsonb_object_agg(tutor_id, stats)
      FROM (
        SELECT 
          tutor_id,
          jsonb_build_object(
            'api_calls', COUNT(*),
            'tokens', COALESCE(SUM(tokens_used), 0),
            'cost', COALESCE(SUM(cost_estimate), 0)
          ) as stats
        FROM usage_logs
        WHERE user_id = p_user_id
          AND created_at >= NOW() - (p_days || ' days')::INTERVAL
          AND tutor_id IS NOT NULL
        GROUP BY tutor_id
      ) tutors
    ) as tutor_breakdown
  FROM usage_logs
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_user_quotas_updated_at 
  BEFORE UPDATE ON user_quotas
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_action_date 
  ON usage_logs(user_id, action, created_at DESC);

