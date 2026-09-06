import { apiClient } from '@/lib/apiClient'
import type { CustomerDashboardSummary, CustomerPayment, SubmitPaymentPayload } from '../types'
import type { Order } from '@/features/checkout/types'
import type { CustomCakeRequest } from '@/features/customCake/types'

export const customerService = {
  /**
   * Fetches aggregated customer dashboard metrics, real counts, and recent activities.
   */
  async getDashboardSummary(): Promise<CustomerDashboardSummary> {
    const response = await apiClient.get<CustomerDashboardSummary>('/customer/summary')
    return response.data
  },

  /**
   * Retrieves all orders placed by the current authenticated customer.
   */
  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/customer/orders')
    return response.data
  },

  /**
   * Retrieves specific customer order details by ID.
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/customer/orders/${orderId}`)
    return response.data
  },

  /**
   * Retrieves payment records submitted by the current customer.
   */
  async getPayments(): Promise<CustomerPayment[]> {
    const response = await apiClient.get<CustomerPayment[]>('/customer/payments')
    return response.data
  },

  /**
   * Submits 12-digit UTR number / transaction reference for Admin payment verification.
   */
  async submitPayment(payload: SubmitPaymentPayload): Promise<CustomerPayment> {
    const response = await apiClient.post<CustomerPayment>('/customer/payments/submit', payload)
    return response.data
  },

  /**
   * Fetches custom cake requests belonging to current customer.
   */
  async getCustomCakes(): Promise<CustomCakeRequest[]> {
    const response = await apiClient.get<CustomCakeRequest[]>('/custom-cakes/my-requests')
    return response.data
  },
}
