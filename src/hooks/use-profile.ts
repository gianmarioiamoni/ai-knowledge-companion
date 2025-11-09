import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { Profile, ProfileUpdate } from '@/types/profile'
import * as profileService from '@/lib/supabase/profile'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const { data, error: fetchError } = await profileService.getProfile()
    
    if (fetchError) {
      setError(fetchError)
    } else if (data) {
      setProfile(data)
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    setError(null)
    const { error: updateError } = await profileService.updateProfile(updates)
    
    if (updateError) {
      setError(updateError)
      return { success: false, error: updateError }
    }
    
    // Refresh profile
    await fetchProfile()
    return { success: true }
  }, [fetchProfile])

  const uploadAvatar = useCallback(async (file: File) => {
    setError(null)
    const { data: avatarUrl, error: uploadError } = await profileService.uploadAvatar(file)
    
    if (uploadError) {
      setError(uploadError)
      return { success: false, error: uploadError }
    }
    
    // Update profile with new avatar URL
    if (avatarUrl) {
      await updateProfile({ avatar_url: avatarUrl })
    }
    
    return { success: true, data: avatarUrl }
  }, [updateProfile])

  const changePassword = useCallback(async (newPassword: string) => {
    setError(null)
    const { error: changeError } = await profileService.changePassword(newPassword)
    
    if (changeError) {
      setError(changeError)
      return { success: false, error: changeError }
    }
    
    return { success: true }
  }, [])

  const deleteAccount = useCallback(async (password: string) => {
    setError(null)
    const { error: deleteError } = await profileService.deleteAccount(password)
    
    if (deleteError) {
      setError(deleteError)
      return { success: false, error: deleteError }
    }
    
    // Account deleted successfully - session has been cleared by the API
    // Redirect to login page to ensure clean state
    router.push('/login')
    return { success: true }
  }, [router])

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    refreshProfile: fetchProfile
  }
}

