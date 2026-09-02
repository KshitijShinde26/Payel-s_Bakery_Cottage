import { z } from 'zod'

// Password strength pattern: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
  role: z.enum(['CUSTOMER', 'SHOPKEEPER', 'ADMIN'], {
    message: 'Please select your role',
  }),
})

export const registerSchema = z
  .object({
    role: z.enum(['CUSTOMER', 'SHOPKEEPER', 'ADMIN'], {
      message: 'Please select a registration role',
    }),

    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    password: z
      .string()
      .min(1, 'Password is required')
      .regex(
        passwordRegex,
        'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(1, 'OTP code is required')
    .length(6, 'Verification code must be exactly 6 characters')
    .regex(/^\d{6}$/, 'OTP code must contain only 6 digits'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Verification code (OTP) is required')
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP code must contain only 6 digits'),
    password: z
      .string()
      .min(1, 'New password is required')
      .regex(
        passwordRegex,
        'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

