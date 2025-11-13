/**
 * Admin and authorization related types
 */

/**
 * Role information passed by admin middleware
 */
export interface RoleInfo {
  userId: string
  role: 'user' | 'admin' | 'super_admin'
  isSuperAdmin: boolean
  isAdmin: boolean
}

/**
 * Admin API route handler context
 */
export interface AdminContext {
  roleInfo: RoleInfo
}

/**
 * Admin route params with userId
 */
export interface UserRouteParams {
  params: Promise<{
    userId: string
  }>
}

/**
 * Admin route params with tutorId
 */
export interface TutorRouteParams {
  params: Promise<{
    tutorId: string
  }>
}

