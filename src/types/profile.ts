export interface Profile {
  id: string
  avatar_url?: string
  full_name?: string
  bio?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  full_name?: string
  bio?: string
  avatar_url?: string
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

