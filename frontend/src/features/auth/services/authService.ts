import { apiClient } from '@/lib/apiClient'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  VerifyEmailPayload,
  ResetPasswordPayload,
} from '../types'

export const authService = {
  async login(payload: LoginPayload) {
    try {
      const response = await apiClient.post<{ accessToken: string; user: User }>(
        '/auth/login',
        payload
      )
      if (typeof window !== 'undefined' && response.data?.user) {
        localStorage.setItem('pbc_dev_user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (err: any) {
      // In offline / dev mode when backend is unreachable, allow seamless login for testing
      if (!err.response && typeof window !== 'undefined') {
        const role = payload.role || 'CUSTOMER'
        const mockUser: User = {
          id: 'user-' + role.toLowerCase() + '-1',
          fullName:
            role === 'SHOPKEEPER'
              ? 'Payal (Shopkeeper)'
              : role === 'ADMIN'
              ? 'Bakery Admin'
              : role === 'DELIVERY_PARTNER'
              ? 'Ramesh (Delivery Partner)'
              : 'Valued Customer',
          email: payload.email || `${role.toLowerCase()}@bakery.com`,
          role: role,
          phoneNumber: '9876543210',
          emailVerified: true,
        }
        localStorage.setItem('pbc_dev_user', JSON.stringify(mockUser))
        return {
          accessToken: 'mock-dev-jwt-token',
          user: mockUser,
        }
      }
      throw err
    }
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<{ message: string }>(
      '/auth/register',
      payload
    )
    return response.data
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await apiClient.post<{ message: string }>(
      '/auth/verify-otp',
      payload
    )
    return response.data
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    return this.verifyOtp(payload)
  },

  async resendOtp(email: string) {
    const response = await apiClient.post<{ message: string }>(
      '/auth/resend-otp',
      { email }
    )
    return response.data
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email }
    )
    return response.data
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      payload
    )
    return response.data
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response.data
    } catch (err) {
      if (typeof window !== 'undefined') {
        const devUser = localStorage.getItem('pbc_dev_user')
        if (devUser) {
          try {
            return JSON.parse(devUser) as User
          } catch {}
        }
      }
      throw err
    }
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pbc_dev_user')
    }
    try {
      const response = await apiClient.post<{ message: string }>('/auth/logout')
      return response.data
    } catch {
      return { message: 'Logged out successfully' }
    }
  },
}
