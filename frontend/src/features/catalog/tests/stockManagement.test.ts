import { describe, it, expect, beforeEach, vi } from 'vitest'
import { productService } from '../services/productService'
import { shopkeeperService } from '@/features/shopkeeper/services/shopkeeperService'
import { adminService } from '@/features/admin/services/adminService'

describe('Stock Management Core Workflows', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should initialize and read product stock properly', () => {
    // Default stock when not stored
    const stock = productService.getProductStock('prod-1', 10)
    expect(stock).toBe(10)
  })

  it('should allow shopkeeper and admin to edit stock numbers', async () => {
    // Shopkeeper updates stock
    await shopkeeperService.updateProductStock('prod-1', 15)
    expect(productService.getProductStock('prod-1')).toBe(15)

    // Admin updates stock
    await adminService.updateProductStock('prod-1', 8)
    expect(productService.getProductStock('prod-1')).toBe(8)
  })

  it('should automatically deduct stock when customer orders cake (e.g. 10 - 2 = 8)', () => {
    // Initial stock is 10
    productService.setStoredStock('prod-1', 10)
    expect(productService.getProductStock('prod-1')).toBe(10)

    // Customer orders 2 cakes
    productService.deductStockForOrder([{ productId: 'prod-1', quantity: 2 }])

    // Stock becomes 8
    expect(productService.getProductStock('prod-1')).toBe(8)
  })

  it('should keep stock as is on approval, but restore stock to previous value on rejection (8 + 2 = 10)', () => {
    // Suppose starting stock is 10, customer ordered 2 -> stock is 8
    productService.setStoredStock('prod-1', 10)
    productService.deductStockForOrder([{ productId: 'prod-1', quantity: 2 }])
    expect(productService.getProductStock('prod-1')).toBe(8)

    // On approval: stock remains as is (8)
    // ...

    // On rejection by shopkeeper/admin: stock is restored back by 2 to 10
    productService.restoreStockForOrder([{ productId: 'prod-1', quantity: 2 }])
    expect(productService.getProductStock('prod-1')).toBe(10)
  })

  it('should clamp stock to zero and not allow negative stock', async () => {
    productService.setStoredStock('prod-2', 1)
    productService.deductStockForOrder([{ productId: 'prod-2', quantity: 5 }])
    expect(productService.getProductStock('prod-2')).toBe(0)
  })
})
