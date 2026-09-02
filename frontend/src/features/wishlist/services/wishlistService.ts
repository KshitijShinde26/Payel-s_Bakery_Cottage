import { apiClient } from '@/lib/apiClient'
import type { Product } from '@/features/catalog/types'
import type { WishlistItem } from '../types'

const WISHLIST_STORAGE_PREFIX = 'payals_bakery_wishlist_'

export const wishlistService = {
  async getWishlist(userId?: string): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.get<WishlistItem[]>('/wishlist')
      return response.data
    } catch {
      if (userId) {
        const local = localStorage.getItem(`${WISHLIST_STORAGE_PREFIX}${userId}`)
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

  async addToWishlist(product: Product, userId?: string, currentItems: WishlistItem[] = []): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.post<WishlistItem[]>('/wishlist', {
        productId: product.id,
      })
      return response.data
    } catch {
      const exists = currentItems.some((item) => item.productId === product.id)
      if (exists) return currentItems

      const newItem: WishlistItem = {
        id: `wishlist-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      }
      const updated = [newItem, ...currentItems]
      if (userId) {
        localStorage.setItem(`${WISHLIST_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }
      return updated
    }
  },

  async removeFromWishlist(productId: string, userId?: string, currentItems: WishlistItem[] = []): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.delete<WishlistItem[]>(`/wishlist/${productId}`)
      return response.data
    } catch {
      const updated = currentItems.filter((item) => item.productId !== productId)
      if (userId) {
        localStorage.setItem(`${WISHLIST_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }
      return updated
    }
  },
}
