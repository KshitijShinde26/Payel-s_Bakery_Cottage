import { apiClient } from '@/lib/apiClient'
import type {
  Order,
  OrderStatus,
  CustomCakeRequest,
  CustomCakeStatus,
  UpdateOrderStatusPayload,
  ReviewCustomCakePayload,
  ShopkeeperSummary,
  Product,
} from '../types'

export const shopkeeperService = {
  // --- SUMMARY / STATS (Real Database Metrics) ---
  async getSummary(): Promise<ShopkeeperSummary> {
    try {
      const response = await apiClient.get<ShopkeeperSummary>('/shopkeeper/summary')
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.error('Failed to fetch live shopkeeper summary from backend', err)
    }

    return {
      totalProducts: 0,
      availableProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      preparingOrders: 0,
      readyOrders: 0,
      outForDeliveryOrders: 0,
      completedOrders: 0,
      pendingPayments: 0,
      pendingCustomCakes: 0,
      totalCustomCakes: 0,
      todayOrders: 0,
    }
  },

  // --- READ-ONLY PRODUCT CATALOG REFERENCE (Real Database Records Only) ---
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/shopkeeper/products', {
        params: {
          ...(category && category !== 'ALL' ? { category } : {}),
          ...(search && search.trim() ? { search: search.trim() } : {}),
        },
      })
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.error('Failed to fetch products from backend', err)
    }
    return []
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/shopkeeper/products/${id}`)
      return response.data
    } catch (err) {
      console.error(`Failed to fetch product #${id} from backend`, err)
      return null
    }
  },

  // --- REAL ORDERS (Database Records Only) ---
  async getOrders(status?: OrderStatus): Promise<Order[]> {
    try {
      const url = status ? `/shopkeeper/orders?status=${status}` : '/shopkeeper/orders'
      const response = await apiClient.get<Order[]>(url)
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.error('Failed to fetch orders from backend', err)
    }
    return []
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/shopkeeper/orders/${orderId}`)
      return response.data
    } catch (err) {
      console.error(`Failed to fetch order #${orderId} from backend`, err)
      return null
    }
  },

  async updateOrderStatus(orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    const response = await apiClient.put<Order>(`/shopkeeper/orders/${orderId}/status`, payload)
    return response.data
  },

  // --- REAL CUSTOM CAKE REQUESTS (Database Records Only) ---
  async getCustomCakes(status?: CustomCakeStatus): Promise<CustomCakeRequest[]> {
    try {
      const url = status ? `/shopkeeper/custom-cakes?status=${status}` : '/shopkeeper/custom-cakes'
      const response = await apiClient.get<CustomCakeRequest[]>(url)
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.error('Failed to fetch custom cakes from backend', err)
    }
    return []
  },

  async getCustomCakeById(id: string): Promise<CustomCakeRequest | null> {
    try {
      const response = await apiClient.get<CustomCakeRequest>(`/shopkeeper/custom-cakes/${id}`)
      return response.data
    } catch (err) {
      console.error(`Failed to fetch custom cake #${id} from backend`, err)
      return null
    }
  },

  async reviewCustomCake(id: string, payload: ReviewCustomCakePayload): Promise<CustomCakeRequest> {
    const response = await apiClient.put<CustomCakeRequest>(`/shopkeeper/custom-cakes/${id}/review`, payload)
    return response.data
  },
}
