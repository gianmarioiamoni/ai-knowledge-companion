import { z } from 'zod'

export const profileUpdateSchema = z.object({
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export const passwordChangeSchema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE', {
    message: 'Please type DELETE to confirm',
  }),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

