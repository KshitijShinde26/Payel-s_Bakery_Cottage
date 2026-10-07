import { apiClient } from '@/lib/apiClient'
import type { CreateOrderPayload, Order, OrderItem } from '../types'

export const orderService = {
  async createOrder(payload: CreateOrderPayload, _userId?: string): Promise<Order> {
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Cannot create an order with an empty cart.')
    }

    if (!payload.deliveryAddress) {
      throw new Error('Please select a valid delivery address.')
    }

    const orderItems: OrderItem[] = payload.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      category: item.category,
      weightOption: item.weightOption,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }))

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.subtotal, 0)
    const orderNumber = `PBC-${Date.now().toString().slice(-6)}`

    const requestBody = {
      orderNumber,
      items: orderItems,
      subtotal,
      deliveryChargeText: 'Delivery charges will be calculated by the bakery',
      grandTotal: subtotal,
      deliveryAddress: payload.deliveryAddress,
      preferredDeliveryDate: payload.preferredDeliveryDate,
      preferredDeliveryTime: payload.preferredDeliveryTime,
      paymentMethod: payload.paymentMethod,
    }

    const response = await apiClient.post<Order>('/orders', requestBody)
    return response.data
  },

  async getMyOrders(_userId?: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>('/orders/my-orders')
      if (Array.isArray(response.data)) {
        return response.data
      }
      return []
    } catch (error) {
      console.warn('Failed to fetch customer orders from backend API:', error)
      return []
    }
  },

  async getOrderById(orderId: string, _userId?: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`)
      if (response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.warn(`Failed to fetch order #${orderId} from backend API:`, error)
      return null
    }
  },
}

