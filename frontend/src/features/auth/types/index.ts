export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  SHOPKEEPER: 'SHOPKEEPER',
  ADMIN: 'ADMIN',
} as const

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]
export type RoleType = 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN'

export interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: RoleType
  emailVerified: boolean
  avatarUrl?: string
}

export interface LoginPayload {
  email: string
  password: string
  role: RoleType
  rememberMe?: boolean
}

export interface RegisterPayload {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  role: RoleType
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface VerifyOtpPayload {
  email: string
  code: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  newPassword: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
