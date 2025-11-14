/**
 * useRole Hook
 * 
 * Provides current user's role and permissions
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'user' | 'admin' | 'super_admin'
export type UserStatus = 'active' | 'disabled'

interface RoleInfo {
  userId: string
  role: UserRole
  status: UserStatus
  email?: string
  displayName?: string
}

interface UseRoleReturn {
  roleInfo: RoleInfo | null
  role: UserRole | null
  isUser: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isActive: boolean
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRole(): UseRoleReturn {
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRole = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRoleInfo(null)
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, display_name')
        .eq('id', user.id)
        .single<{ role: string; status: string; display_name: string | null }>()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      setRoleInfo({
        userId: user.id,
        role: (profile.role as UserRole) || 'user',
        status: (profile.status as UserStatus) || 'active',
        email: user.email,
        displayName: profile.display_name || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRole()
  }, [])

  return {
    roleInfo,
    role: roleInfo?.role || null,
    isUser: roleInfo?.role === 'user',
    isAdmin: roleInfo?.role === 'admin' || roleInfo?.role === 'super_admin',
    isSuperAdmin: roleInfo?.role === 'super_admin',
    isActive: roleInfo?.status === 'active',
    loading,
    error,
    refresh: fetchRole,
  }
}

