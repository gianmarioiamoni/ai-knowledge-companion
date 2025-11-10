-- =====================================================
-- Test with Real User ID
-- Since auth.uid() returns null in SQL Editor, we'll use the actual user ID
-- =====================================================

-- Replace this with your actual user ID from the previous query
-- User ID: 05237d7e-320d-45ba-9499-94ef49e3be89
-- Email: gia.iamoni@tiscali.it

DO $$
DECLARE
  v_user_id UUID := '05237d7e-320d-45ba-9499-94ef49e3be89'; -- Your actual user ID
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE 'Testing with User ID: %', v_user_id;
  RAISE NOTICE 'Email: gia.iamoni@tiscali.it';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;

-- 1. Check user subscription
SELECT 
  '1️⃣ USER SUBSCRIPTION' as test,
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  sp.max_image_files,
  us.end_date,
  EXTRACT(DAY FROM us.end_date - NOW())::INTEGER as days_remaining
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '05237d7e-320d-45ba-9499-94ef49e3be89';

-- 2. Test check_usage_limit function for this user
SELECT 
  '2️⃣ CHECK USAGE LIMIT (image)' as test,
  can_create,
  current_count,
  max_allowed,
  message
FROM check_usage_limit('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID, 'image');

-- 3. Check all resource limits
SELECT 
  '3️⃣ ALL RESOURCE LIMITS' as test,
  resource_type,
  can_create,
  current_count,
  max_allowed,
  message
FROM (
  SELECT 'tutors' as resource_type, * FROM check_usage_limit('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID, 'tutors')
  UNION ALL
  SELECT 'documents' as resource_type, * FROM check_usage_limit('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID, 'documents')
  UNION ALL
  SELECT 'audio' as resource_type, * FROM check_usage_limit('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID, 'audio')
  UNION ALL
  SELECT 'video' as resource_type, * FROM check_usage_limit('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID, 'video')
  UNION ALL
  SELECT 'image' as resource_type, * FROM check_usage_limit('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID, 'image')
) limits
ORDER BY resource_type;

-- 4. Check user profile and role
SELECT 
  '4️⃣ USER PROFILE' as test,
  p.id,
  p.role,
  au.email,
  p.created_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.id = '05237d7e-320d-45ba-9499-94ef49e3be89';

-- 5. Check get_user_subscription function
SELECT 
  '5️⃣ GET_USER_SUBSCRIPTION FUNCTION' as test,
  *
FROM get_user_subscription('05237d7e-320d-45ba-9499-94ef49e3be89'::UUID);

-- 6. Count current image files for this user
SELECT 
  '6️⃣ CURRENT IMAGE FILES' as test,
  COUNT(*) as image_count
FROM documents
WHERE owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
  AND media_type = 'image';

-- 7. Final diagnostic
DO $$
DECLARE
  v_user_id UUID := '05237d7e-320d-45ba-9499-94ef49e3be89';
  v_subscription_count INTEGER;
  v_can_create BOOLEAN;
  v_max_allowed INTEGER;
  v_message TEXT;
  v_role TEXT;
BEGIN
  -- Check subscription exists
  SELECT COUNT(*) INTO v_subscription_count
  FROM user_subscriptions
  WHERE user_id = v_user_id
    AND status IN ('active', 'trial')
    AND end_date > NOW();
  
  -- Test check_usage_limit
  SELECT can_create, max_allowed, message 
  INTO v_can_create, v_max_allowed, v_message
  FROM check_usage_limit(v_user_id, 'image')
  LIMIT 1;
  
  -- Get user role
  SELECT role INTO v_role
  FROM profiles
  WHERE id = v_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '📊 DIAGNOSTIC RESULTS';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'User Role: %', COALESCE(v_role, 'NOT FOUND');
  RAISE NOTICE 'Active Subscriptions: %', v_subscription_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Image Upload Check:';
  RAISE NOTICE '  Can Create: %', v_can_create;
  RAISE NOTICE '  Max Allowed: %', v_max_allowed;
  RAISE NOTICE '  Message: %', v_message;
  RAISE NOTICE '';
  
  IF v_can_create THEN
    RAISE NOTICE '✅ USER CAN UPLOAD IMAGES!';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 The subscription is working correctly in the database.';
    RAISE NOTICE 'If the upload still fails, the problem is elsewhere:';
    RAISE NOTICE '1. Check browser console for errors';
    RAISE NOTICE '2. Check server logs (terminal where npm run dev runs)';
    RAISE NOTICE '3. Make sure you''re logged in as gia.iamoni@tiscali.it';
    RAISE NOTICE '4. Try hard reload (Ctrl/Cmd + Shift + R)';
  ELSE
    RAISE NOTICE '❌ USER CANNOT UPLOAD IMAGES';
    RAISE NOTICE '';
    RAISE NOTICE 'Reason: %', v_message;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 TROUBLESHOOTING:';
    IF v_subscription_count = 0 THEN
      RAISE NOTICE '• No active subscription found';
      RAISE NOTICE '• Run: CREATE_ENTERPRISE_SUBSCRIPTION.sql';
    ELSE
      RAISE NOTICE '• Subscription exists but check_usage_limit fails';
      RAISE NOTICE '• Check the function logic';
    END IF;
  END IF;
  RAISE NOTICE '';
END $$;

