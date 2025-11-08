/**
 * Super Admin Bootstrap System
 * 
 * Ensures there is always exactly one super admin in the system.
 * Creates the super admin account on first run using credentials from env vars.
 * Checks and re-creates super admin if missing on subsequent runs.
 */

import { createServiceClient } from '@/lib/supabase/service'

interface BootstrapResult {
  success: boolean
  action: 'created' | 'exists' | 'error'
  message: string
  superAdminId?: string
  error?: string
}

/**
 * Bootstrap super admin account
 * 
 * This function should be called on application startup.
 * It will:
 * 1. Check if a super admin exists in the database
 * 2. If not, create one using env credentials
 * 3. If exists, verify email matches env (optional security check)
 */
export async function bootstrapSuperAdmin(): Promise<BootstrapResult> {
  try {
    const supabase = createServiceClient()

    // Get super admin credentials from env
    const superAdminEmail = process.env.ADMIN_EMAIL
    const superAdminPassword = process.env.ADMIN_PASSWORD

    // Validate env vars
    if (!superAdminEmail || !superAdminPassword) {
      console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables')
      return {
        success: false,
        action: 'error',
        message: 'Super admin credentials not configured',
        error: 'Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables'
      }
    }

    // Check if super admin already exists
    const { data: existingSuperAdmin, error: queryError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'super_admin')
      .single()

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking for existing super admin:', queryError)
      return {
        success: false,
        action: 'error',
        message: 'Failed to check existing super admin',
        error: queryError.message
      }
    }

    // If super admin exists, verify and return
    if (existingSuperAdmin) {
      // Get user email from auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(existingSuperAdmin.id)
      
      if (authUser.user && authUser.user.email === superAdminEmail) {
        console.log('✅ Super admin already exists:', superAdminEmail)
        return {
          success: true,
          action: 'exists',
          message: 'Super admin already exists',
          superAdminId: existingSuperAdmin.id
        }
      } else {
        console.warn('⚠️  Super admin exists but email mismatch!')
        console.warn(`   Database: ${authUser.user?.email}`)
        console.warn(`   Environment: ${superAdminEmail}`)
        return {
          success: true,
          action: 'exists',
          message: 'Super admin exists but email mismatch detected',
          superAdminId: existingSuperAdmin.id
        }
      }
    }

    // Super admin doesn't exist - create it
    console.log('🔧 Creating super admin account...')

    // 1. Create auth user using admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        display_name: 'Super Admin',
        is_super_admin: true
      }
    })

    if (authError || !authData.user) {
      // Check if user already exists in auth but not in profiles
      if (authError?.message?.includes('already registered')) {
        console.log('🔍 User exists in auth.users, checking profile...')
        
        // Get user by email
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const userMatch = existingUser.users.find(u => u.email === superAdminEmail)
        
        if (userMatch) {
          // Update profile to super_admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: 'super_admin',
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', userMatch.id)
          
          if (updateError) {
            console.error('❌ Error updating profile to super_admin:', updateError)
            return {
              success: false,
              action: 'error',
              message: 'Failed to update existing user to super admin',
              error: updateError.message
            }
          }
          
          console.log('✅ Updated existing user to super admin:', superAdminEmail)
          return {
            success: true,
            action: 'created',
            message: 'Existing user promoted to super admin',
            superAdminId: userMatch.id
          }
        }
      }

      console.error('❌ Error creating super admin auth user:', authError)
      return {
        success: false,
        action: 'error',
        message: 'Failed to create super admin auth user',
        error: authError?.message || 'Unknown error'
      }
    }

    const userId = authData.user.id

    // 2. Update profile to set role to super_admin
    // Note: Profile should be auto-created by trigger, but we update it explicitly
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'super_admin',
        status: 'active',
        display_name: 'Super Admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('❌ Error updating super admin profile:', profileError)
      
      // Try to insert if update failed (profile might not exist)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'super_admin',
          status: 'active',
          display_name: 'Super Admin'
        })
      
      if (insertError) {
        console.error('❌ Error inserting super admin profile:', insertError)
        return {
          success: false,
          action: 'error',
          message: 'Failed to create super admin profile',
          error: insertError.message
        }
      }
    }

    console.log('✅ Super admin created successfully:', superAdminEmail)
    console.log('   User ID:', userId)

    return {
      success: true,
      action: 'created',
      message: 'Super admin created successfully',
      superAdminId: userId
    }
  } catch (error) {
    console.error('❌ Unexpected error in bootstrapSuperAdmin:', error)
    return {
      success: false,
      action: 'error',
      message: 'Unexpected error during bootstrap',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verify super admin credentials
 * 
 * Useful for manual verification or health checks
 */
export async function verifySuperAdmin(): Promise<{
  exists: boolean
  email?: string
  userId?: string
  error?: string
}> {
  try {
    const supabase = createServiceClient()

    const { data: superAdmin, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .eq('status', 'active')
      .single()

    if (error || !superAdmin) {
      return {
        exists: false,
        error: error?.message || 'Super admin not found'
      }
    }

    // Get email from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(superAdmin.id)

    return {
      exists: true,
      email: authUser.user?.email,
      userId: superAdmin.id
    }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if given user ID is the super admin
 */
export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.role === 'super_admin' && data.status === 'active'
  } catch {
    return false
  }
}

