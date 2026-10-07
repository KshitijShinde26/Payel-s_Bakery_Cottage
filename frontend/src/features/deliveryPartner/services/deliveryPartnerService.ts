import { apiClient } from '@/lib/apiClient'
import type {
  DeliveryPartnerSummary,
  DeliveryOrder,
  DeliveryPartnerProfile,
  UpdateDeliveryPartnerPayload,
  DeliveryFailurePayload,
  DeliveryOtpPayload,
} from '../types'

export const deliveryPartnerService = {
  async getDashboardSummary(): Promise<DeliveryPartnerSummary> {
    const response = await apiClient.get<DeliveryPartnerSummary>('/delivery-partner/dashboard')
    return response.data
  },

  async getAssignedOrders(): Promise<DeliveryOrder[]> {
    const response = await apiClient.get<DeliveryOrder[]>('/delivery-partner/orders')
    return response.data
  },

  async getOrderById(id: string): Promise<DeliveryOrder> {
    const response = await apiClient.get<DeliveryOrder>(`/delivery-partner/orders/${id}`)
    return response.data
  },

  async startDelivery(orderId: string): Promise<DeliveryOrder> {
    const response = await apiClient.patch<DeliveryOrder>(`/delivery-partner/orders/${orderId}/out-for-delivery`)
    return response.data
  },

  async confirmDelivery(orderId: string, payload: DeliveryOtpPayload): Promise<DeliveryOrder> {
    const response = await apiClient.post<DeliveryOrder>(`/delivery-partner/orders/${orderId}/deliver`, payload)
    return response.data
  },

  async reportDeliveryFailure(orderId: string, payload: DeliveryFailurePayload): Promise<DeliveryOrder> {
    const response = await apiClient.post<DeliveryOrder>(`/delivery-partner/orders/${orderId}/delivery-failed`, payload)
    return response.data
  },

  async getProfile(): Promise<DeliveryPartnerProfile> {
    const response = await apiClient.get<DeliveryPartnerProfile>('/delivery-partner/profile')
    return response.data
  },

  async updateProfile(payload: UpdateDeliveryPartnerPayload): Promise<DeliveryPartnerProfile> {
    const response = await apiClient.put<DeliveryPartnerProfile>('/delivery-partner/profile', payload)
    return response.data
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/delivery-partner/change-password', payload)
    return response.data
  },
}
