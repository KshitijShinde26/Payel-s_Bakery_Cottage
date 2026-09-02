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
    const response = await apiClient.post<{ accessToken: string; user: User }>(
      '/auth/login',
      payload
    )
    return response.data
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
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  async logout() {
    const response = await apiClient.post<{ message: string }>('/auth/logout')
    return response.data
  },
}
