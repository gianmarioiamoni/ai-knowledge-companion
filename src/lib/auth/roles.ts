/**
 * Role-Based Authorization Helpers
 * 
 * Provides functions to check user roles and permissions.
 * Used in API routes and server components.
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type UserRole = 'user' | 'admin' | 'super_admin'
export type UserStatus = 'active' | 'disabled'

export interface UserRoleInfo {
  userId: string
  role: UserRole
  status: UserStatus
  email?: string
  displayName?: string
}

/**
 * Get current authenticated user's role
 * 
 * @returns UserRoleInfo or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRoleInfo | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, status, display_name')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return null
    }

    return {
      userId: user.id,
      role: profile.role as UserRole,
      status: profile.status as UserStatus,
      email: user.email,
      displayName: profile.display_name || undefined,
    }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}

/**
 * Check if current user is authenticated and active
 */
export async function isAuthenticated(): Promise<boolean> {
  const roleInfo = await getCurrentUserRole()
  return roleInfo !== null && roleInfo.status === 'active'
}

/**
 * Check if current user is an admin (admin or super_admin)
 */
export async function isAdmin(): Promise<boolean> {
  const roleInfo = await getCurrentUserRole()
  if (!roleInfo || roleInfo.status !== 'active') {
    return false
  }
  return roleInfo.role === 'admin' || roleInfo.role === 'super_admin'
}

/**
 * Check if current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const roleInfo = await getCurrentUserRole()
  if (!roleInfo || roleInfo.status !== 'active') {
    return false
  }
  return roleInfo.role === 'super_admin'
}

/**
 * Get user role by user ID (using service client)
 * 
 * Used for server-side checks where we need to verify another user's role
 */
export async function getUserRoleById(
  userId: string
): Promise<UserRoleInfo | null> {
  try {
    const supabase = createServiceClient()

    // Get user from auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId)

    if (authError || !authUser.user) {
      return null
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status, display_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      userId,
      role: profile.role as UserRole,
      status: profile.status as UserStatus,
      email: authUser.user.email,
      displayName: profile.display_name || undefined,
    }
  } catch (error) {
    console.error('Error getting user role by ID:', error)
    return null
  }
}

/**
 * Check if user has required role
 * 
 * @param requiredRole - Minimum required role
 * @param userRole - User's actual role (defaults to current user)
 * 
 * Role hierarchy: user < admin < super_admin
 */
export function hasRole(
  requiredRole: UserRole,
  userRole?: UserRole | null
): boolean {
  if (!userRole) {
    return false
  }

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    super_admin: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user can perform action on another user
 * 
 * Rules:
 * - Super admin can act on anyone except themselves (for some actions)
 * - Admin can act on users only
 * - Users cannot act on others
 */
export function canActOnUser(
  actorRole: UserRole,
  targetRole: UserRole,
  action: 'view' | 'edit' | 'delete' | 'disable' | 'promote'
): boolean {
  // Super admin can do anything
  if (actorRole === 'super_admin') {
    // Super admin cannot demote themselves
    if (action === 'promote' && targetRole === 'super_admin') {
      return false
    }
    return true
  }

  // Admin can only view and reset password for users
  if (actorRole === 'admin') {
    if (targetRole === 'user' && (action === 'view' || action === 'edit')) {
      return true
    }
    return false
  }

  // Regular users have no admin permissions
  return false
}

/**
 * Require authentication
 * 
 * Throws error if user is not authenticated
 */
export async function requireAuth(): Promise<UserRoleInfo> {
  const roleInfo = await getCurrentUserRole()

  if (!roleInfo) {
    throw new Error('Authentication required')
  }

  if (roleInfo.status !== 'active') {
    throw new Error('User account is disabled')
  }

  return roleInfo
}

/**
 * Require admin role
 * 
 * Throws error if user is not an admin
 */
export async function requireAdmin(): Promise<UserRoleInfo> {
  const roleInfo = await requireAuth()

  if (roleInfo.role !== 'admin' && roleInfo.role !== 'super_admin') {
    throw new Error('Admin access required')
  }

  return roleInfo
}

/**
 * Require super admin role
 * 
 * Throws error if user is not a super admin
 */
export async function requireSuperAdmin(): Promise<UserRoleInfo> {
  const roleInfo = await requireAuth()

  if (roleInfo.role !== 'super_admin') {
    throw new Error('Super admin access required')
  }

  return roleInfo
}

/**
 * Check if user is disabled
 */
export async function isUserDisabled(userId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.status === 'disabled'
  } catch {
    return false
  }
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(params: {
  adminId: string
  action:
    | 'promote_admin'
    | 'demote_admin'
    | 'disable_user'
    | 'enable_user'
    | 'delete_user'
    | 'reset_password'
    | 'edit_tutor_visibility'
  targetUserId?: string
  targetResourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  try {
    const supabase = createServiceClient()

    await supabase.from('admin_audit_log').insert({
      admin_id: params.adminId,
      action: params.action,
      target_user_id: params.targetUserId,
      target_resource_id: params.targetResourceId,
      metadata: params.metadata || {},
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    })
  } catch (error) {
    console.error('Error logging admin action:', error)
    // Don't throw - logging should not break the main action
  }
}

