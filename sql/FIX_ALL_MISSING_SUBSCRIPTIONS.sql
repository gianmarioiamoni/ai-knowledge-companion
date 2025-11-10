-- =====================================================
-- Fix Missing Subscriptions for ALL Users
-- This script assigns trial subscriptions to all users who don't have one
-- =====================================================

-- 1. Find users without subscriptions
SELECT 
  '1️⃣ USERS WITHOUT SUBSCRIPTION' as step,
  COUNT(*) as total_users_without_subscription
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us
  WHERE us.user_id = au.id
);

-- 2. List users without subscriptions (for verification)
SELECT 
  '2️⃣ USER LIST' as step,
  au.id,
  au.email,
  au.created_at,
  'Missing subscription' as issue
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us
  WHERE us.user_id = au.id
)
ORDER BY au.created_at DESC
LIMIT 10;

-- 3. Assign trial subscriptions to all users without one
DO $$
DECLARE
  v_trial_plan_id UUID;
  v_trial_days INTEGER;
  v_users_fixed INTEGER := 0;
  v_user RECORD;
BEGIN
  -- Get trial plan
  SELECT id, trial_days INTO v_trial_plan_id, v_trial_days
  FROM subscription_plans
  WHERE name = 'trial'
  LIMIT 1;
  
  IF v_trial_plan_id IS NULL THEN
    RAISE EXCEPTION 'Trial plan not found! Run migration 25_subscription_plans.sql first.';
  END IF;
  
  -- Loop through users without subscriptions
  FOR v_user IN 
    SELECT au.id, au.email, au.created_at
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM user_subscriptions us
      WHERE us.user_id = au.id
    )
  LOOP
    -- Create trial subscription
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      trial_end_date
    ) VALUES (
      v_user.id,
      v_trial_plan_id,
      'trial',
      NOW(),
      NOW() + INTERVAL '1 day' * v_trial_days,
      NOW() + INTERVAL '1 day' * v_trial_days
    );
    
    v_users_fixed := v_users_fixed + 1;
    
    RAISE NOTICE 'Created subscription for: % (%)', v_user.email, v_user.id;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed subscriptions for % users', v_users_fixed;
  RAISE NOTICE '   Trial duration: % days', v_trial_days;
END $$;

-- 4. Verify all users now have subscriptions
SELECT 
  '3️⃣ VERIFICATION' as step,
  total_users,
  users_with_subscription,
  users_without_subscription,
  CASE 
    WHEN users_without_subscription = 0 THEN '✅ All users have subscriptions'
    ELSE '⚠️  Some users still missing subscriptions'
  END as status
FROM (
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_subscriptions) as users_with_subscription,
    (
      SELECT COUNT(*) 
      FROM auth.users au
      WHERE NOT EXISTS (
        SELECT 1 FROM user_subscriptions us
        WHERE us.user_id = au.id
      )
    ) as users_without_subscription
) stats;

-- 5. Show subscription summary by plan
SELECT 
  '4️⃣ SUBSCRIPTION SUMMARY' as step,
  sp.name,
  sp.display_name,
  COUNT(us.id) as user_count,
  COUNT(CASE WHEN us.status = 'trial' THEN 1 END) as trial_count,
  COUNT(CASE WHEN us.status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN us.status = 'expired' THEN 1 END) as expired_count
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON us.plan_id = sp.id
GROUP BY sp.id, sp.name, sp.display_name
ORDER BY sp.sort_order;

-- 6. Final message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ ALL SUBSCRIPTIONS FIXED!';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was done:';
  RAISE NOTICE '• Assigned trial subscriptions to all users without one';
  RAISE NOTICE '• All users can now upload images';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Optional: Fix the trigger to prevent future issues';
  RAISE NOTICE 'The trigger should auto-assign subscriptions to new users.';
  RAISE NOTICE 'If it''s not working, check: assign_trial_plan_trigger';
  RAISE NOTICE '';
END $$;

