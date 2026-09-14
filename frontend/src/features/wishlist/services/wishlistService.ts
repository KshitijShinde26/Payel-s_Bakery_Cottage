import type { Product } from '@/features/catalog/types'
import type { WishlistItem } from '../types'

const WISHLIST_STORAGE_PREFIX = 'payals_bakery_wishlist_'

export const wishlistService = {
  async getWishlist(userId?: string): Promise<WishlistItem[]> {
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
    const guestWishlist = localStorage.getItem(`${WISHLIST_STORAGE_PREFIX}guest`)
    if (guestWishlist) {
      try {
        return JSON.parse(guestWishlist)
      } catch {
        return []
      }
    }
    return []
  },

  async addToWishlist(product: Product, userId?: string, currentItems: WishlistItem[] = []): Promise<WishlistItem[]> {
    const exists = currentItems.some((item) => item.productId === product.id)
    if (exists) return currentItems

    const newItem: WishlistItem = {
      id: `wishlist-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      product,
      addedAt: new Date().toISOString(),
    }
    const updated = [newItem, ...currentItems]
    const key = userId ? `${WISHLIST_STORAGE_PREFIX}${userId}` : `${WISHLIST_STORAGE_PREFIX}guest`
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  },

  async removeFromWishlist(productId: string, userId?: string, currentItems: WishlistItem[] = []): Promise<WishlistItem[]> {
    const updated = currentItems.filter((item) => item.productId !== productId)
    const key = userId ? `${WISHLIST_STORAGE_PREFIX}${userId}` : `${WISHLIST_STORAGE_PREFIX}guest`
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  },
}
