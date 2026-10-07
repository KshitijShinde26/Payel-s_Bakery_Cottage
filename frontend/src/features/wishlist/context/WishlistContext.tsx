import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import { wishlistService } from '../services/wishlistService'
import type { WishlistItem } from '../types'
import type { Product } from '@/features/catalog/types'
import toast from 'react-hot-toast'

export interface WishlistContextValue {
  items: WishlistItem[]
  isLoading: boolean
  addToWishlist: (product: Product) => Promise<boolean>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  moveToCart: (product: Product, weightOption?: string) => Promise<boolean>
  wishlistCount: number
}

export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const loadWishlist = async () => {
      if (!isAuthenticated || user?.role !== 'CUSTOMER') {
        setItems([])
        return
      }

      setIsLoading(true)
      try {
        const loaded = await wishlistService.getWishlist(user?.id)
        if (isMounted) {
          setItems(loaded)
        }
      } catch (err) {
        console.error('Failed to load wishlist', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadWishlist()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.id, user?.role])

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.productId === productId)
    },
    [items]
  )

  const addToWishlist = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!isAuthenticated) {
        toast.error('Please sign in to save items to your wishlist.')
        return false
      }

      if (user?.role !== 'CUSTOMER') {
        toast.error('Only Customer accounts can maintain a wishlist.')
        return false
      }

      try {
        const updated = await wishlistService.addToWishlist(product, user?.id, items)
        setItems(updated)
        toast.success(`"${product.name}" added to your wishlist!`)
        return true
      } catch (err) {
        console.error('Error adding to wishlist', err)
        toast.error('Could not save to wishlist.')
        return false
      }
    },
    [isAuthenticated, user?.id, user?.role, items]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      try {
        const updated = await wishlistService.removeFromWishlist(productId, user?.id, items)
        setItems(updated)
        toast.success('Item removed from wishlist.')
      } catch (err) {
        console.error('Error removing from wishlist', err)
        toast.error('Could not remove from wishlist.')
      }
    },
    [user?.id, items]
  )

  const moveToCart = useCallback(
    async (product: Product, weightOption?: string): Promise<boolean> => {
      if (!product.isAvailable) {
        toast.error('This product is currently out of stock and cannot be added to cart.')
        return false
      }

      // 1. Add to cart
      const added = await addToCart({
        product,
        weightOption: weightOption || product.weightOptions?.[0] || 'Standard',
        quantity: 1,
      })

      // 2. If successful, remove from wishlist
      if (added) {
        await removeFromWishlist(product.id)
        toast.success(`"${product.name}" moved from wishlist to your cart!`)
        return true
      }
      return false
    },
    [addToCart, removeFromWishlist]
  )

  const wishlistCount = items.length

  const contextValue = useMemo(
    () => ({
      items,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      moveToCart,
      wishlistCount,
    }),
    [items, isLoading, addToWishlist, removeFromWishlist, isInWishlist, moveToCart, wishlistCount]
  )

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>
}
