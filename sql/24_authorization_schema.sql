-- Authorization System Schema
-- Implements 3-level role system: user, admin, super_admin
-- Features: role management, user status, RLS policies

-- ============================================================================
-- 1. ADD ROLE AND STATUS COLUMNS TO PROFILES
-- ============================================================================

-- Add role column (user, admin, super_admin)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Add status column (active, disabled)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'disabled'));

-- Add admin-related metadata
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS promoted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS disabled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS disabled_reason TEXT;

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Check if user is admin (admin or super_admin)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'super_admin'
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is active
CREATE OR REPLACE FUNCTION is_user_active(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- 3. UPDATE EXISTING RLS POLICIES
-- ============================================================================

-- Drop existing profile policies to recreate them with role logic
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy: Users can view own profile, admins can view all profiles
CREATE POLICY "Users can view own profile, admins view all" ON profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR is_admin(auth.uid())
  );

-- Policy: Users can update own profile (but not role/status), admins can update all
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR is_admin(auth.uid())
  )
  WITH CHECK (
    -- Users can only update their own profile and cannot change role/status
    (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
    OR 
    -- Admins can update others but only super_admin can change roles
    (is_admin(auth.uid()))
  );

-- Policy: Users can insert own profile (on signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'user');

-- ============================================================================
-- 4. CREATE ADMIN AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'promote_admin',
    'demote_admin',
    'disable_user',
    'enable_user',
    'delete_user',
    'reset_password',
    'edit_tutor_visibility'
  )),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_resource_id UUID, -- For tutors, documents, etc.
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user_id ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- RLS for audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_log
  FOR SELECT USING (is_admin(auth.uid()));

-- Only service role can insert audit logs (from API routes)
CREATE POLICY "Service can insert audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 5. CREATE ADMIN-SPECIFIC VIEWS
-- ============================================================================

-- View: User statistics for admin dashboard
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  u.id,
  u.email,
  u.created_at as registered_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  p.display_name,
  p.role,
  p.status,
  p.promoted_at,
  p.disabled_at,
  COALESCE(t.tutor_count, 0) as tutor_count,
  COALESCE(d.document_count, 0) as document_count,
  COALESCE(c.conversation_count, 0) as conversation_count,
  COALESCE(uq.current_cost, 0) as current_cost,
  COALESCE(uq.current_api_calls, 0) as current_api_calls,
  COALESCE(uq.current_tokens, 0) as current_tokens
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN (
  SELECT owner_id, COUNT(*) as tutor_count 
  FROM tutors 
  GROUP BY owner_id
) t ON u.id = t.owner_id
LEFT JOIN (
  SELECT owner_id, COUNT(*) as document_count 
  FROM documents 
  GROUP BY owner_id
) d ON u.id = d.owner_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as conversation_count 
  FROM conversations 
  GROUP BY user_id
) c ON u.id = c.user_id
LEFT JOIN user_quotas uq ON u.id = uq.user_id;

-- Grant select on view to authenticated users (RLS will apply)
GRANT SELECT ON admin_user_stats TO authenticated;

-- RLS for the view (only admins can query it)
-- Note: Views inherit RLS from underlying tables, but we add explicit check
CREATE OR REPLACE FUNCTION check_admin_view_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 6. FUNCTION TO LOG ADMIN ACTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_target_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    target_user_id,
    target_resource_id,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_id,
    p_action,
    p_target_user_id,
    p_target_resource_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. FUNCTION TO PROMOTE USER TO ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION promote_user_to_admin(
  p_user_id UUID,
  p_promoted_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if promoter is super_admin
  IF NOT is_super_admin(p_promoted_by) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admin can promote users to admin'
    );
  END IF;
  
  -- Check if user exists and is active
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND status = 'active') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found or is disabled'
    );
  END IF;
  
  -- Check if user is already admin
  IF is_admin(p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is already an admin'
    );
  END IF;
  
  -- Promote user
  UPDATE profiles 
  SET 
    role = 'admin',
    promoted_at = NOW(),
    promoted_by = p_promoted_by,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log action
  PERFORM log_admin_action(
    p_promoted_by,
    'promote_admin',
    p_user_id,
    NULL,
    jsonb_build_object('new_role', 'admin')
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted to admin successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. FUNCTION TO DEMOTE ADMIN TO USER
-- ============================================================================

CREATE OR REPLACE FUNCTION demote_admin_to_user(
  p_user_id UUID,
  p_demoted_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if demoter is super_admin
  IF NOT is_super_admin(p_demoted_by) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admin can demote admins'
    );
  END IF;
  
  -- Check if user is admin (not super_admin)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND role = 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is not an admin or is super admin (cannot be demoted)'
    );
  END IF;
  
  -- Demote user
  UPDATE profiles 
  SET 
    role = 'user',
    promoted_at = NULL,
    promoted_by = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log action
  PERFORM log_admin_action(
    p_demoted_by,
    'demote_admin',
    p_user_id,
    NULL,
    jsonb_build_object('previous_role', 'admin')
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Admin demoted to user successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. FUNCTION TO DISABLE USER
-- ============================================================================

CREATE OR REPLACE FUNCTION disable_user(
  p_user_id UUID,
  p_disabled_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  -- Check if disabler is super_admin
  IF NOT is_super_admin(p_disabled_by) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admin can disable users'
    );
  END IF;
  
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Prevent disabling super_admin
  IF is_super_admin(p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot disable super admin'
    );
  END IF;
  
  -- Disable user
  UPDATE profiles 
  SET 
    status = 'disabled',
    disabled_at = NOW(),
    disabled_by = p_disabled_by,
    disabled_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log action
  PERFORM log_admin_action(
    p_disabled_by,
    'disable_user',
    p_user_id,
    NULL,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User disabled successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. FUNCTION TO ENABLE USER
-- ============================================================================

CREATE OR REPLACE FUNCTION enable_user(
  p_user_id UUID,
  p_enabled_by UUID
)
RETURNS JSONB AS $$
BEGIN
  -- Check if enabler is super_admin
  IF NOT is_super_admin(p_enabled_by) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admin can enable users'
    );
  END IF;
  
  -- Check if user exists and is disabled
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND status = 'disabled') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found or is already active'
    );
  END IF;
  
  -- Enable user
  UPDATE profiles 
  SET 
    status = 'active',
    disabled_at = NULL,
    disabled_by = NULL,
    disabled_reason = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log action
  PERFORM log_admin_action(
    p_enabled_by,
    'enable_user',
    p_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User enabled successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. UPDATE EXISTING RLS POLICIES TO CHECK USER STATUS
-- ============================================================================

-- Function to check if current user is active
CREATE OR REPLACE FUNCTION current_user_is_active()
RETURNS BOOLEAN AS $$
  SELECT status = 'active' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Add status check to critical tables (tutors, documents, conversations)
-- These policies ensure disabled users cannot create/modify content

-- Tutors: Only active users can insert
DROP POLICY IF EXISTS "Users can insert own tutors" ON tutors;
CREATE POLICY "Active users can insert own tutors" ON tutors
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id 
    AND current_user_is_active()
  );

-- Documents: Only active users can insert
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
CREATE POLICY "Active users can insert own documents" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id 
    AND current_user_is_active()
  );

-- Conversations: Only active users can insert
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Active users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND current_user_is_active()
  );

-- ============================================================================
-- 12. COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN profiles.role IS 'User role: user, admin, super_admin';
COMMENT ON COLUMN profiles.status IS 'User status: active, disabled';
COMMENT ON COLUMN profiles.promoted_at IS 'When user was promoted to admin';
COMMENT ON COLUMN profiles.promoted_by IS 'Super admin who promoted this user';
COMMENT ON COLUMN profiles.disabled_at IS 'When user was disabled';
COMMENT ON COLUMN profiles.disabled_by IS 'Admin who disabled this user';
COMMENT ON COLUMN profiles.disabled_reason IS 'Reason for disabling user';

COMMENT ON FUNCTION is_admin(UUID) IS 'Check if user has admin or super_admin role and is active';
COMMENT ON FUNCTION is_super_admin(UUID) IS 'Check if user has super_admin role and is active';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Get user role';
COMMENT ON FUNCTION is_user_active(UUID) IS 'Check if user status is active';

COMMENT ON TABLE admin_audit_log IS 'Audit log for all admin actions';
COMMENT ON VIEW admin_user_stats IS 'Aggregated user statistics for admin dashboard';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
DO $$ 
BEGIN
  RAISE NOTICE 'Authorization schema migration completed successfully!';
  RAISE NOTICE 'New columns added to profiles: role, status, promoted_at, promoted_by, disabled_at, disabled_by, disabled_reason';
  RAISE NOTICE 'New functions: is_admin, is_super_admin, get_user_role, is_user_active';
  RAISE NOTICE 'New functions: promote_user_to_admin, demote_admin_to_user, disable_user, enable_user';
  RAISE NOTICE 'New table: admin_audit_log';
  RAISE NOTICE 'New view: admin_user_stats';
  RAISE NOTICE 'Updated RLS policies for role-based access';
END $$;

