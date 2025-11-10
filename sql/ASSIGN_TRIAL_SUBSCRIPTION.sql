-- =====================================================
-- Assign Trial Subscription to Current User
-- Run this script to fix "No active subscription found" error
-- =====================================================

-- 1. Check current user
SELECT 
  '1️⃣ CURRENT USER' as step,
  id as user_id,
  email,
  created_at as registered_at
FROM auth.users
WHERE id = auth.uid();

-- 2. Check if user already has a subscription
SELECT 
  '2️⃣ EXISTING SUBSCRIPTION' as step,
  us.id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  us.start_date,
  us.end_date,
  CASE 
    WHEN us.end_date > NOW() THEN '✅ Active'
    ELSE '❌ Expired'
  END as subscription_status
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = auth.uid();

-- 3. Get trial plan details
SELECT 
  '3️⃣ TRIAL PLAN' as step,
  id,
  name,
  display_name,
  max_tutors,
  max_documents,
  max_audio_files,
  max_video_files,
  max_image_files,
  trial_days
FROM subscription_plans
WHERE name = 'trial';

-- 4. Create trial subscription for current user (if doesn't exist)
DO $$
DECLARE
  v_trial_plan_id UUID;
  v_trial_days INTEGER;
  v_user_id UUID;
  v_existing_count INTEGER;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found. Please login first.';
  END IF;
  
  -- Check if user already has a subscription
  SELECT COUNT(*) INTO v_existing_count
  FROM user_subscriptions
  WHERE user_id = v_user_id;
  
  IF v_existing_count > 0 THEN
    RAISE NOTICE '⚠️  User already has a subscription. Skipping creation.';
    RETURN;
  END IF;
  
  -- Get trial plan
  SELECT id, trial_days INTO v_trial_plan_id, v_trial_days
  FROM subscription_plans
  WHERE name = 'trial'
  LIMIT 1;
  
  IF v_trial_plan_id IS NULL THEN
    RAISE EXCEPTION 'Trial plan not found! Run migration 25_subscription_plans.sql first.';
  END IF;
  
  -- Create trial subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    trial_end_date
  ) VALUES (
    v_user_id,
    v_trial_plan_id,
    'trial',
    NOW(),
    NOW() + INTERVAL '1 day' * v_trial_days,
    NOW() + INTERVAL '1 day' * v_trial_days
  );
  
  RAISE NOTICE '✅ Trial subscription created successfully!';
  RAISE NOTICE '   Duration: % days', v_trial_days;
  RAISE NOTICE '   Expires: %', (NOW() + INTERVAL '1 day' * v_trial_days)::date;
END $$;

-- 5. Verify subscription was created
SELECT 
  '4️⃣ NEW SUBSCRIPTION' as step,
  us.id as subscription_id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  sp.max_tutors,
  sp.max_documents,
  sp.max_audio_files,
  sp.max_video_files,
  sp.max_image_files,
  us.start_date,
  us.end_date,
  EXTRACT(DAY FROM us.end_date - NOW())::INTEGER as days_remaining,
  '✅ Active' as status_message
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = auth.uid();

-- 6. Test usage limit for images
SELECT 
  '5️⃣ IMAGE UPLOAD TEST' as step,
  can_create,
  current_count,
  max_allowed,
  message,
  CASE 
    WHEN can_create THEN '✅ You can upload images!'
    ELSE '❌ Cannot upload images'
  END as result
FROM check_usage_limit(auth.uid(), 'image');

-- 7. Final verification message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ SUBSCRIPTION SETUP COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Reload your application (Ctrl/Cmd + Shift + R)';
  RAISE NOTICE '2. Go to Multimedia → Images';
  RAISE NOTICE '3. Try uploading an image';
  RAISE NOTICE '4. It should work now! 🎉';
  RAISE NOTICE '';
END $$;

