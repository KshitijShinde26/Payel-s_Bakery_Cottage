import { apiClient } from '@/lib/apiClient'
import type { CartItem, AddToCartPayload } from '../types'

const CART_STORAGE_PREFIX = 'payals_bakery_cart_'

export const cartService = {
  async getCart(userId?: string): Promise<CartItem[]> {
    try {
      // Try backend Cart API
      const response = await apiClient.get<CartItem[]>('/cart')
      return response.data
    } catch {
      // Graceful fallback during Phase 3 frontend integration

      if (userId) {
        const local = localStorage.getItem(`${CART_STORAGE_PREFIX}${userId}`)
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

  async addItem(payload: AddToCartPayload, userId?: string, currentItems: CartItem[] = []): Promise<CartItem[]> {
    const { product, weightOption = product.weightOptions?.[0] || 'Standard', quantity = 1 } = payload

    try {
      const response = await apiClient.post<CartItem[]>('/cart/items', {
        productId: product.id,
        weightOption,
        quantity,
      })
      return response.data
    } catch {
      // Frontend state calculation
      const existingIndex = currentItems.findIndex(
        (item) => item.productId === product.id && item.weightOption === weightOption
      )

      let updated: CartItem[]
      if (existingIndex > -1) {
        updated = currentItems.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + quantity
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            }
          }
          return item
        })
      } else {
        const newItem: CartItem = {
          id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          unitPrice: product.price,
          weightOption,
          quantity,
          isAvailable: product.isAvailable,
          subtotal: quantity * product.price,
        }
        updated = [...currentItems, newItem]
      }

      if (userId) {
        localStorage.setItem(`${CART_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }
      return updated
    }
  },

  async updateQuantity(itemId: string, newQuantity: number, userId?: string, currentItems: CartItem[] = []): Promise<CartItem[]> {
    if (newQuantity < 1) return currentItems

    try {
      const response = await apiClient.put<CartItem[]>(`/cart/items/${itemId}`, {
        quantity: newQuantity,
      })
      return response.data
    } catch {
      const updated = currentItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.unitPrice,
          }
        }
        return item
      })

      if (userId) {
        localStorage.setItem(`${CART_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }
      return updated
    }
  },

  async removeItem(itemId: string, userId?: string, currentItems: CartItem[] = []): Promise<CartItem[]> {
    try {
      const response = await apiClient.delete<CartItem[]>(`/cart/items/${itemId}`)
      return response.data
    } catch {
      const updated = currentItems.filter((item) => item.id !== itemId)
      if (userId) {
        localStorage.setItem(`${CART_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }
      return updated
    }
  },

  async clearCart(userId?: string): Promise<void> {
    try {
      await apiClient.delete('/cart')
    } catch {
      if (userId) {
        localStorage.removeItem(`${CART_STORAGE_PREFIX}${userId}`)
      }
    }
  },
}
