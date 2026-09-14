import type { CartItem, AddToCartPayload } from '../types'

const CART_STORAGE_PREFIX = 'payals_bakery_cart_'

export const cartService = {
  async getCart(userId?: string): Promise<CartItem[]> {
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
    // Also check default session key if user not logged in yet
    const guestCart = localStorage.getItem(`${CART_STORAGE_PREFIX}guest`)
    if (guestCart) {
      try {
        return JSON.parse(guestCart)
      } catch {
        return []
      }
    }
    return []
  },

  async addItem(payload: AddToCartPayload, userId?: string, currentItems: CartItem[] = []): Promise<CartItem[]> {
    const { product, weightOption = product.weightOptions?.[0] || 'Standard', quantity = 1 } = payload

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

    const key = userId ? `${CART_STORAGE_PREFIX}${userId}` : `${CART_STORAGE_PREFIX}guest`
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  },

  async updateQuantity(itemId: string, newQuantity: number, userId?: string, currentItems: CartItem[] = []): Promise<CartItem[]> {
    if (newQuantity < 1) return currentItems

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

    const key = userId ? `${CART_STORAGE_PREFIX}${userId}` : `${CART_STORAGE_PREFIX}guest`
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  },

  async removeItem(itemId: string, userId?: string, currentItems: CartItem[] = []): Promise<CartItem[]> {
    const updated = currentItems.filter((item) => item.id !== itemId)
    const key = userId ? `${CART_STORAGE_PREFIX}${userId}` : `${CART_STORAGE_PREFIX}guest`
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  },

  async clearCart(userId?: string): Promise<void> {
    const key = userId ? `${CART_STORAGE_PREFIX}${userId}` : `${CART_STORAGE_PREFIX}guest`
    localStorage.removeItem(key)
  },
}
