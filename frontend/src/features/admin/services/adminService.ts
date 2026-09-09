import { apiClient } from '@/lib/apiClient'
import type { Product } from '@/features/catalog/types'
import type {
  AdminSummary,
  AdminUser,
  AdminPayment,
  AuditLog,
  Order,
  OrderStatus,
  CustomCakeRequest,
  CustomCakeStatus,
  FeasibilityDecision,
} from '../types'

export const adminService = {
  async getSummary(): Promise<AdminSummary> {
    const response = await apiClient.get<AdminSummary>('/admin/summary')
    return response.data
  },

  async getUsers(role?: string, search?: string): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>('/admin/users', {
      params: {
        ...(role && role !== 'ALL' ? { role } : {}),
        ...(search && search.trim() ? { search: search.trim() } : {}),
      },
    })
    return response.data
  },

  async updateUserStatus(userId: string, enabled: boolean): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser>(`/admin/users/${userId}/status`, {
      enabled,
    })
    return response.data
  },

  async getOrders(status?: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/admin/orders', {
      params: {
        ...(status && status !== 'ALL' ? { status } : {}),
      },
    })
    return response.data
  },

  async updateOrderStatus(
    orderId: string,
    payload: { status: OrderStatus; kitchenNotes?: string }
  ): Promise<Order> {
    const response = await apiClient.put<Order>(`/admin/orders/${orderId}/status`, payload)
    return response.data
  },

  async getCustomCakes(status?: string): Promise<CustomCakeRequest[]> {
    const response = await apiClient.get<CustomCakeRequest[]>('/admin/custom-cakes', {
      params: {
        ...(status && status !== 'ALL' ? { status } : {}),
      },
    })
    return response.data
  },

  async reviewCustomCake(
    id: string,
    payload: {
      status: CustomCakeStatus
      confirmedPrice?: number
      estimatedPrice?: number
      feasibilityDecision: FeasibilityDecision
      bakeryNotes: string
    }
  ): Promise<CustomCakeRequest> {
    const response = await apiClient.put<CustomCakeRequest>(`/admin/custom-cakes/${id}/review`, payload)
    return response.data
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>('/admin/audit-logs')
    return response.data
  },

  // ==========================================
  // PAYMENT VERIFICATION APIS
  // ==========================================

  async getPayments(): Promise<AdminPayment[]> {
    const response = await apiClient.get<AdminPayment[]>('/admin/payments')
    return response.data
  },

  async getPendingPayments(): Promise<AdminPayment[]> {
    const response = await apiClient.get<AdminPayment[]>('/admin/payments/pending')
    return response.data
  },

  async verifyPayment(paymentId: string): Promise<AdminPayment> {
    const response = await apiClient.post<AdminPayment>(`/admin/payments/${paymentId}/verify`)
    return response.data
  },

  async rejectPayment(paymentId: string, reason?: string): Promise<AdminPayment> {
    const response = await apiClient.post<AdminPayment>(`/admin/payments/${paymentId}/reject`, {
      reason: reason || 'Payment details could not be verified.',
    })
    return response.data
  },

  // ==========================================
  // PRODUCT MANAGEMENT APIS
  // ==========================================

  async getAdminProducts(category?: string, search?: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/admin/products', {
      params: {
        ...(category && category !== 'ALL' ? { category } : {}),
        ...(search && search.trim() ? { search: search.trim() } : {}),
      },
    })
    return response.data
  },

  async getAdminProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/admin/products/${id}`)
    return response.data
  },

  async createProduct(payload: Partial<Product>): Promise<Product> {
    const response = await apiClient.post<Product>('/admin/products', payload)
    return response.data
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<Product>(`/admin/products/${id}`, payload)
    return response.data
  },

  async toggleProductAvailability(id: string, available?: boolean): Promise<Product> {
    const response = await apiClient.patch<Product>(`/admin/products/${id}/availability`, null, {
      params: {
        ...(available !== undefined ? { available } : {}),
      },
    })
    return response.data
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`)
  },

  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<{ imageUrl: string }>('/admin/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.imageUrl
  },
}
