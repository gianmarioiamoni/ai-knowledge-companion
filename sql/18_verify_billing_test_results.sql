-- Verify Billing Test Results
-- Check if the usage was properly logged and quota updated

-- 1. Check recent usage logs (should show the test query)
SELECT 
  user_id,
  tutor_id,
  action,
  api_calls,
  tokens_used,
  cost_estimate,
  metadata->>'model' as model,
  metadata->>'chunks_retrieved' as chunks_retrieved,
  created_at
FROM usage_logs
ORDER BY created_at DESC
LIMIT 3;

-- 2. Check user quota for the test user
SELECT 
  user_id,
  current_api_calls,
  current_tokens,
  current_cost,
  max_api_calls_per_month,
  max_tokens_per_month,
  max_cost_per_month,
  ROUND((current_api_calls::numeric / max_api_calls_per_month * 100), 2) as api_calls_percent,
  ROUND((current_tokens::numeric / max_tokens_per_month * 100), 2) as tokens_percent,
  ROUND((current_cost::numeric / max_cost_per_month * 100), 2) as cost_percent,
  last_reset_at,
  next_reset_at
FROM user_quotas
WHERE user_id = '05237d7e-320d-45ba-9499-94ef49e3be89';

-- 3. Check if any alerts were generated
SELECT 
  user_id,
  alert_type,
  threshold_value,
  current_value,
  message,
  is_read,
  created_at
FROM usage_alerts
WHERE user_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Summary: What was tracked?
SELECT 
  COUNT(*) as total_logs,
  SUM(api_calls) as total_api_calls,
  SUM(tokens_used) as total_tokens,
  SUM(cost_estimate) as total_cost
FROM usage_logs
WHERE user_id = '05237d7e-320d-45ba-9499-94ef49e3be89';

