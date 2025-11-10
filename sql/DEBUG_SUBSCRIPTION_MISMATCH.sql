-- =====================================================
-- Debug Subscription Mismatch
-- Find out why UI shows Enterprise but DB shows no subscription
-- =====================================================

-- 1. Get current authenticated user info
SELECT 
  '1️⃣ CURRENT USER (auth.uid())' as step,
  auth.uid() as user_id_from_auth,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email;

-- 2. Check ALL subscriptions in the database (regardless of user)
SELECT 
  '2️⃣ ALL SUBSCRIPTIONS IN DB' as step,
  us.id,
  us.user_id,
  au.email as user_email,
  sp.name as plan_name,
  sp.display_name as plan_display,
  us.status,
  us.start_date,
  us.end_date,
  EXTRACT(DAY FROM us.end_date - NOW())::INTEGER as days_remaining,
  CASE 
    WHEN us.end_date > NOW() AND us.status IN ('active', 'trial') THEN '✅ Active'
    ELSE '❌ Inactive/Expired'
  END as is_valid
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users au ON au.id = us.user_id
ORDER BY us.created_at DESC;

-- 3. Check if there's a subscription for current user (by email match)
SELECT 
  '3️⃣ SUBSCRIPTIONS FOR CURRENT USER EMAIL' as step,
  us.id,
  us.user_id,
  au.email,
  sp.name as plan_name,
  us.status,
  us.start_date,
  us.end_date,
  CASE 
    WHEN us.user_id = auth.uid() THEN '✅ User ID matches auth.uid()'
    ELSE '❌ User ID DOES NOT match auth.uid()'
  END as user_id_match
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users au ON au.id = us.user_id
WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- 4. Check profiles table for current user
SELECT 
  '4️⃣ PROFILE FOR CURRENT USER' as step,
  p.id as profile_id,
  au.email,
  p.role,
  p.created_at,
  CASE 
    WHEN p.id = auth.uid() THEN '✅ Profile ID matches auth.uid()'
    ELSE '❌ Profile ID DOES NOT match auth.uid()'
  END as profile_match
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.id = auth.uid();

-- 5. Check if there are multiple users with similar emails
SELECT 
  '5️⃣ CHECK FOR DUPLICATE USERS' as step,
  au.id,
  au.email,
  au.created_at,
  (SELECT COUNT(*) FROM user_subscriptions WHERE user_id = au.id) as subscription_count,
  CASE 
    WHEN au.id = auth.uid() THEN '✅ This is the current user'
    ELSE 'Other user'
  END as is_current_user
FROM auth.users au
WHERE au.email LIKE '%' || (SELECT SPLIT_PART(email, '@', 1) FROM auth.users WHERE id = auth.uid()) || '%'
ORDER BY au.created_at DESC;

-- 6. Check user_subscriptions table structure and RLS
SELECT 
  '6️⃣ USER_SUBSCRIPTIONS RLS STATUS' as step,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions';

-- 7. Try to select from user_subscriptions without RLS filter
-- This will show if there's a subscription but RLS is blocking it
SELECT 
  '7️⃣ RAW QUERY (bypassing RLS if possible)' as step,
  us.*,
  sp.name as plan_name,
  sp.display_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = auth.uid();

-- 8. Check Stripe-related fields (if using Stripe)
SELECT 
  '8️⃣ STRIPE INTEGRATION CHECK' as step,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_subscriptions'
  AND column_name LIKE '%stripe%'
ORDER BY ordinal_position;

-- 9. Final diagnostic
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_subscription_count INTEGER;
  v_enterprise_plan_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  SELECT COUNT(*) INTO v_subscription_count
  FROM user_subscriptions
  WHERE user_id = v_user_id;
  
  SELECT id INTO v_enterprise_plan_id
  FROM subscription_plans
  WHERE name = 'enterprise';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '🔍 DIAGNOSTIC SUMMARY';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE 'Current User ID: %', v_user_id;
  RAISE NOTICE 'Current Email: %', v_email;
  RAISE NOTICE 'Subscriptions found: %', v_subscription_count;
  RAISE NOTICE 'Enterprise Plan ID: %', v_enterprise_plan_id;
  RAISE NOTICE '';
  
  IF v_subscription_count = 0 THEN
    RAISE NOTICE '❌ NO SUBSCRIPTION FOUND in database for this user';
    RAISE NOTICE '   But UI shows Enterprise subscription';
    RAISE NOTICE '   → This is a DATA MISMATCH problem!';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 RECOMMENDED ACTION:';
    RAISE NOTICE '   Run: sql/CREATE_ENTERPRISE_SUBSCRIPTION.sql';
  ELSE
    RAISE NOTICE '✅ Subscription exists in database';
    RAISE NOTICE '   Check if it matches the Enterprise plan shown in UI';
  END IF;
  RAISE NOTICE '';
END $$;

