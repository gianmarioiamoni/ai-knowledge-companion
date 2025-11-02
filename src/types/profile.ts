export interface Profile {
  id: string
  avatar_url?: string
  display_name?: string  // From existing schema
  full_name?: string     // New column we're adding
  bio?: string
  settings?: Record<string, any>  // From existing schema
  email?: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  display_name?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  settings?: Record<string, any>
}

export interface PasswordChange {
  current_password?: string
  new_password: string
  confirm_password: string
}

export interface DeleteAccountRequest {
  password: string
  confirmation: string
}

