-- Check Usage Data After Chat Test
-- Run this after making a chat query to verify tracking works

-- 1. Check recent usage logs
SELECT 
  user_id,
  tutor_id,
  action,
  api_calls,
  tokens_used,
  cost_estimate,
  metadata,
  created_at
FROM usage_logs
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check user quotas (should be initialized after first usage)
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
  next_reset_at
FROM user_quotas
ORDER BY updated_at DESC;

-- 3. Check any alerts generated
SELECT 
  user_id,
  alert_type,
  threshold_value,
  current_value,
  message,
  is_read,
  created_at
FROM usage_alerts
ORDER BY created_at DESC
LIMIT 5;

-- 4. Get usage summary for user (replace UUID with your user_id)
-- SELECT * FROM get_usage_summary('YOUR_USER_ID_HERE', 30);

