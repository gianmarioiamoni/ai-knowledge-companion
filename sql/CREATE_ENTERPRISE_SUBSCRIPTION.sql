-- =====================================================
-- Create Enterprise Subscription for Current User
-- This will sync the database with what the UI is showing
-- =====================================================

-- 1. Show current user
SELECT 
  '1️⃣ CURRENT USER' as step,
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE id = auth.uid();

-- 2. Check existing subscription (before)
SELECT 
  '2️⃣ EXISTING SUBSCRIPTION (BEFORE)' as step,
  us.id,
  sp.name,
  sp.display_name,
  us.status,
  us.end_date
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = auth.uid();

-- 3. Get Enterprise plan details
SELECT 
  '3️⃣ ENTERPRISE PLAN DETAILS' as step,
  id,
  name,
  display_name,
  price_monthly,
  max_tutors,
  max_documents,
  max_audio_files,
  max_video_files,
  max_image_files
FROM subscription_plans
WHERE name = 'enterprise';

-- 4. Delete any existing subscription for this user (to avoid conflicts)
DELETE FROM user_subscriptions
WHERE user_id = auth.uid();

-- 5. Create Enterprise Monthly subscription
DO $$
DECLARE
  v_enterprise_plan_id UUID;
  v_user_id UUID;
  v_end_date TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found. Please login first.';
  END IF;
  
  -- Get Enterprise plan ID
  SELECT id INTO v_enterprise_plan_id
  FROM subscription_plans
  WHERE name = 'enterprise'
  LIMIT 1;
  
  IF v_enterprise_plan_id IS NULL THEN
    RAISE EXCEPTION 'Enterprise plan not found! Run migration 25_subscription_plans.sql first.';
  END IF;
  
  -- Set end date to match what UI shows (09/12/2025)
  -- Using December 9, 2025 as shown in the UI screenshot
  v_end_date := '2025-12-09 23:59:59'::TIMESTAMPTZ;
  
  -- Create Enterprise subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    billing_cycle,
    next_payment_date
  ) VALUES (
    v_user_id,
    v_enterprise_plan_id,
    'active',
    NOW(),
    v_end_date,
    'monthly',
    '2025-12-09'::DATE
  );
  
  RAISE NOTICE '✅ Enterprise subscription created successfully!';
  RAISE NOTICE '   Plan: Enterprise - Monthly';
  RAISE NOTICE '   Status: Active';
  RAISE NOTICE '   End Date: %', v_end_date::DATE;
  RAISE NOTICE '   Days Remaining: %', EXTRACT(DAY FROM v_end_date - NOW())::INTEGER;
END $$;

-- 6. Verify new subscription
SELECT 
  '4️⃣ NEW SUBSCRIPTION (AFTER)' as step,
  us.id as subscription_id,
  sp.name as plan_name,
  sp.display_name,
  sp.max_tutors,
  sp.max_documents,
  sp.max_audio_files,
  sp.max_video_files,
  sp.max_image_files,
  us.status,
  us.billing_cycle,
  us.start_date,
  us.end_date,
  us.next_payment_date,
  EXTRACT(DAY FROM us.end_date - NOW())::INTEGER as days_remaining,
  '✅ Active' as status_message
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = auth.uid();

-- 7. Test image upload limit
SELECT 
  '5️⃣ IMAGE UPLOAD LIMIT TEST' as step,
  can_create,
  current_count,
  max_allowed,
  message,
  CASE 
    WHEN can_create THEN '✅ You can upload up to 200 images!'
    ELSE '❌ Cannot upload images'
  END as result
FROM check_usage_limit(auth.uid(), 'image');

-- 8. Test all resource limits
SELECT 
  '6️⃣ ALL RESOURCE LIMITS' as step,
  resource_type,
  can_create,
  current_count,
  max_allowed,
  message
FROM (
  SELECT 'tutors' as resource_type, * FROM check_usage_limit(auth.uid(), 'tutors')
  UNION ALL
  SELECT 'documents' as resource_type, * FROM check_usage_limit(auth.uid(), 'documents')
  UNION ALL
  SELECT 'audio' as resource_type, * FROM check_usage_limit(auth.uid(), 'audio')
  UNION ALL
  SELECT 'video' as resource_type, * FROM check_usage_limit(auth.uid(), 'video')
  UNION ALL
  SELECT 'image' as resource_type, * FROM check_usage_limit(auth.uid(), 'image')
) limits
ORDER BY resource_type;

-- 9. Final message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ ENTERPRISE SUBSCRIPTION CREATED!';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Your limits:';
  RAISE NOTICE '• AI Tutors: Unlimited';
  RAISE NOTICE '• Documents: 500';
  RAISE NOTICE '• Audio Files: 100';
  RAISE NOTICE '• Video Files: 50';
  RAISE NOTICE '• Image Files: 200';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Reload your application (Ctrl/Cmd + Shift + R)';
  RAISE NOTICE '2. Go to Multimedia → Images';
  RAISE NOTICE '3. Try uploading an image';
  RAISE NOTICE '4. It should work now! 🎉';
  RAISE NOTICE '';
END $$;

