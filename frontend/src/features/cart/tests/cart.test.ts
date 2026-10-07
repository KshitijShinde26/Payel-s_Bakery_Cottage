import { describe, it, expect } from 'vitest'
import { cartService } from '../services/cartService'
import { CLIENT_PRODUCTS } from '@/features/catalog/services/productService'

describe('Cart Service & Operations', () => {
  const sampleProduct = CLIENT_PRODUCTS[0] // Traditional Rich Plum Cake (₹650)
  const secondProduct = CLIENT_PRODUCTS[1] // Custom Birthday Cake (₹850)

  it('should add an item to an empty cart', async () => {
    const updated = await cartService.addItem(
      { product: sampleProduct, weightOption: '500g', quantity: 1 },
      'test-user',
      []
    )
    expect(updated.length).toBe(1)
    expect(updated[0].productId).toBe(sampleProduct.id)
    expect(updated[0].quantity).toBe(1)
    expect(updated[0].subtotal).toBe(sampleProduct.price)
  })

  it('should increment quantity when duplicate item with same weight is added', async () => {
    const initial = await cartService.addItem(
      { product: sampleProduct, weightOption: '500g', quantity: 1 },
      'test-user',
      []
    )

    const updated = await cartService.addItem(
      { product: sampleProduct, weightOption: '500g', quantity: 2 },
      'test-user',
      initial
    )

    expect(updated.length).toBe(1)
    expect(updated[0].quantity).toBe(3)
    expect(updated[0].subtotal).toBe(3 * sampleProduct.price)
  })

  it('should add separate cart item if same product has different weight option', async () => {
    const initial = await cartService.addItem(
      { product: sampleProduct, weightOption: '500g', quantity: 1 },
      'test-user',
      []
    )

    const updated = await cartService.addItem(
      { product: sampleProduct, weightOption: '1kg', quantity: 1 },
      'test-user',
      initial
    )

    expect(updated.length).toBe(2)
  })

  it('should update quantity correctly and recalculate item subtotal', async () => {
    const initial = await cartService.addItem(
      { product: sampleProduct, weightOption: '500g', quantity: 1 },
      'test-user',
      []
    )
    const itemId = initial[0].id

    const updated = await cartService.updateQuantity(itemId, 4, 'test-user', initial)
    expect(updated[0].quantity).toBe(4)
    expect(updated[0].subtotal).toBe(4 * sampleProduct.price)
  })

  it('should reject quantities less than 1', async () => {
    const initial = await cartService.addItem(
      { product: sampleProduct, weightOption: '500g', quantity: 2 },
      'test-user',
      []
    )
    const itemId = initial[0].id

    const updated = await cartService.updateQuantity(itemId, 0, 'test-user', initial)
    expect(updated[0].quantity).toBe(2) // unchanged
  })

  it('should remove an item from the cart', async () => {
    const step1 = await cartService.addItem({ product: sampleProduct }, 'test-user', [])
    const step2 = await cartService.addItem({ product: secondProduct }, 'test-user', step1)
    expect(step2.length).toBe(2)

    const itemIdToRemove = step2[0].id
    const updated = await cartService.removeItem(itemIdToRemove, 'test-user', step2)
    expect(updated.length).toBe(1)
    expect(updated[0].productId).toBe(secondProduct.id)
  })
})
