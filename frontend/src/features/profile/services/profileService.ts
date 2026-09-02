import { apiClient } from '@/lib/apiClient'
import type { User } from '@/features/auth/types'

export const profileService = {
  async updateProfile(payload: { fullName: string; phoneNumber: string }) {
    const response = await apiClient.put<User>('/users/profile', payload)
    return response.data
  },

  async changePassword(payload: any) {
    const response = await apiClient.post<{ message: string }>(
      '/users/change-password',
      payload
    )
    return response.data
  },

  async uploadAvatar(formData: FormData) {
    const response = await apiClient.post<{ avatarUrl: string }>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}
