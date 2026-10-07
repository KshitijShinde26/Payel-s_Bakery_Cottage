import { z } from 'zod'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const editProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .regex(
        passwordRegex,
        'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmNewPassword: z.string().min(1, 'Confirm new password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
