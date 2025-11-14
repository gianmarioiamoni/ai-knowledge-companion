import { createClient } from './client'
import type { Profile, ProfileUpdate } from '@/types/profile'

export async function getProfile(): Promise<{ data?: Profile; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data: profile, error } = await (supabase
      .from('profiles') as any)
      .select('*')
      .eq('id', user.id)
      .single()
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (error) {
      console.error('Error fetching profile:', error)
      return { error: error.message }
    }

    if (!profile) {
      return { error: 'Profile not found' }
    }

    return { 
      data: {
        ...profile,
        email: user.email
      } 
    }
  } catch (error) {
    console.error('Exception fetching profile:', error)
    return { error: 'Failed to fetch profile' }
  }
}

export async function updateProfile(updates: ProfileUpdate): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Update profile error:', result.error)
      return { error: result.error }
    }

    return {}
  } catch (error) {
    console.error('Update profile exception:', error)
    return { error: 'Failed to update profile' }
  }
}

export async function uploadAvatar(file: File): Promise<{ data?: string; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return { data: publicUrl }
  } catch (error) {
    console.error('Upload avatar exception:', error)
    return { error: 'Failed to upload avatar' }
  }
}

export async function changePassword(newPassword: string): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_password: newPassword }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Change password error:', result.error)
      return { error: result.error }
    }

    return {}
  } catch (error) {
    console.error('Change password exception:', error)
    return { error: 'Failed to change password' }
  }
}

export async function deleteAccount(password: string): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/profile/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Delete account error:', result.error)
      return { error: result.error }
    }

    // Success - the session has been cleared by the API
    return {}
  } catch (error) {
    console.error('Delete account exception:', error)
    return { error: 'Failed to delete account' }
  }
}

