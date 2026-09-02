import { describe, it, expect } from 'vitest'
import { wishlistService } from '../services/wishlistService'
import { CLIENT_PRODUCTS } from '@/features/catalog/services/productService'

describe('Wishlist Service & Operations', () => {
  const sampleProduct = CLIENT_PRODUCTS[0]
  const secondProduct = CLIENT_PRODUCTS[1]

  it('should add a product to wishlist', async () => {
    const updated = await wishlistService.addToWishlist(sampleProduct, 'test-user', [])
    expect(updated.length).toBe(1)
    expect(updated[0].productId).toBe(sampleProduct.id)
    expect(updated[0].product.name).toBe(sampleProduct.name)
  })

  it('should not add duplicate product to wishlist', async () => {
    const initial = await wishlistService.addToWishlist(sampleProduct, 'test-user', [])
    const updated = await wishlistService.addToWishlist(sampleProduct, 'test-user', initial)
    expect(updated.length).toBe(1)
  })

  it('should remove a product from wishlist', async () => {
    const step1 = await wishlistService.addToWishlist(sampleProduct, 'test-user', [])
    const step2 = await wishlistService.addToWishlist(secondProduct, 'test-user', step1)
    expect(step2.length).toBe(2)

    const updated = await wishlistService.removeFromWishlist(sampleProduct.id, 'test-user', step2)
    expect(updated.length).toBe(1)
    expect(updated[0].productId).toBe(secondProduct.id)
  })
})
