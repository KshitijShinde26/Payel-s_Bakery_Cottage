import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cartService } from '../services/cartService'
import type { CartItem, CartSummary, AddToCartPayload } from '../types'
import toast from 'react-hot-toast'

export interface CartContextValue {
  items: CartItem[]
  summary: CartSummary
  isLoading: boolean
  addToCart: (payload: AddToCartPayload) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  totalItemCount: number
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Load cart on auth state change
  useEffect(() => {
    let isMounted = true
    const loadUserCart = async () => {
      if (!isAuthenticated || user?.role !== 'CUSTOMER') {
        setItems([])
        return
      }

      setIsLoading(true)
      try {
        const loaded = await cartService.getCart(user?.id)
        if (isMounted) {
          setItems(loaded)
        }
      } catch (err) {
        console.error('Failed to load cart', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUserCart()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.id, user?.role])

  const addToCart = useCallback(
    async (payload: AddToCartPayload): Promise<boolean> => {
      if (!isAuthenticated) {
        toast.error('Please sign in to add items to your cart.')
        return false
      }

      if (user?.role !== 'CUSTOMER') {
        toast.error('Only Customer accounts can add products to cart.')
        return false
      }

      if (!payload.product.isAvailable) {
        toast.error('This item is currently out of stock.')
        return false
      }

      setIsLoading(true)
      try {
        const updated = await cartService.addItem(payload, user?.id, items)
        setItems(updated)
        toast.success(`"${payload.product.name}" added to your cart!`)
        return true
      } catch (err) {
        console.error('Error adding to cart', err)
        toast.error('Failed to add item to cart. Please try again.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, user?.id, user?.role, items]
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return

      try {
        const updated = await cartService.updateQuantity(itemId, quantity, user?.id, items)
        setItems(updated)
      } catch (err) {
        console.error('Error updating quantity', err)
        toast.error('Could not update quantity.')
      }
    },
    [user?.id, items]
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        const itemToRemove = items.find((i) => i.id === itemId)
        const updated = await cartService.removeItem(itemId, user?.id, items)
        setItems(updated)
        if (itemToRemove) {
          toast.success(`Removed "${itemToRemove.name}" from cart.`)
        }
      } catch (err) {
        console.error('Error removing item from cart', err)
        toast.error('Could not remove item.')
      }
    },
    [user?.id, items]
  )

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart(user?.id)
      setItems([])
      toast.success('Your cart has been cleared.')
    } catch (err) {
      console.error('Error clearing cart', err)
    }
  }, [user?.id])

  const summary = useMemo<CartSummary>(() => {
    const subtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0)
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0)
    return {
      subtotal,
      totalItems,
      totalUniqueItems: items.length,
      grandTotal: subtotal,
    }
  }, [items])

  const totalItemCount = summary.totalItems

  const contextValue = useMemo(
    () => ({
      items,
      summary,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItemCount,
    }),
    [items, summary, isLoading, addToCart, updateQuantity, removeFromCart, clearCart, totalItemCount]
  )

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}
