/**
 * Authentication Utilities
 * 
 * Exports both client-side and server-side auth helpers
 */

// Server-side auth (SSR)
export { getUserServer, isAuthenticated, requireAuth } from './get-user-server'
export type { GetUserServerResult } from './get-user-server'

