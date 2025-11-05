-- Verify Billing Schema
-- Check that all billing tables and functions exist

-- 1. Check billing tables exist
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('usage_logs', 'user_quotas', 'usage_alerts', 'billing_periods')
ORDER BY table_name;



-- 3. Check user_quotas table structure
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_quotas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check billing functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'log_usage_and_check_quota',
    'initialize_user_quota',
    'get_usage_summary',
    'check_and_create_alert',
    'reset_monthly_quotas'
  )
ORDER BY routine_name;

-- 5. Sample data check
SELECT 
  (SELECT COUNT(*) FROM usage_logs) as total_usage_logs,
  (SELECT COUNT(*) FROM user_quotas) as total_user_quotas,
  (SELECT COUNT(*) FROM usage_alerts) as total_alerts,
  (SELECT COUNT(*) FROM billing_periods) as total_periods;

-- 6. Check RLS policies for billing tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('usage_logs', 'user_quotas', 'usage_alerts', 'billing_periods')
ORDER BY tablename, policyname;

