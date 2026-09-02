import { apiClient } from '@/lib/apiClient'
import type { CreateOrderPayload, Order, OrderItem } from '../types'

const ORDER_STORAGE_PREFIX = 'payals_bakery_orders_'

export const orderService = {
  async createOrder(payload: CreateOrderPayload, userId?: string): Promise<Order> {
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

    try {
      const response = await apiClient.post<Order>('/orders', requestBody)
      return response.data
    } catch {
      // Offline fallback & session synchronization during Phase 5
      const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        orderNumber,
        userId: userId || 'guest',
        items: orderItems,
        subtotal,
        deliveryChargeText: 'Delivery charges will be calculated by the bakery',
        grandTotal: subtotal,
        deliveryAddress: payload.deliveryAddress,
        preferredDeliveryDate: payload.preferredDeliveryDate,
        preferredDeliveryTime: payload.preferredDeliveryTime,
        paymentMethod: payload.paymentMethod,
        orderStatus: 'AWAITING_PAYMENT',
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (userId) {
        const existing = await this.getMyOrders(userId)
        const updated = [newOrder, ...existing]
        localStorage.setItem(`${ORDER_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }

      return newOrder
    }
  },

  async getMyOrders(userId?: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>('/orders/my-orders')
      return response.data
    } catch {
      if (userId) {
        const local = localStorage.getItem(`${ORDER_STORAGE_PREFIX}${userId}`)
        if (local) {
          try {
            return JSON.parse(local)
          } catch {
            return []
          }
        }
      }
      return []
    }
  },

  async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`)
      return response.data
    } catch {
      if (userId) {
        const list = await this.getMyOrders(userId)
        return list.find((o) => o.id === orderId || o.orderNumber === orderId) || null
      }
      return null
    }
  },
}
