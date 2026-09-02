import { describe, it, expect } from 'vitest'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'
import type { DeliveryAddress, CreateOrderPayload } from '../types'
import { CLIENT_PRODUCTS } from '@/features/catalog/services/productService'

describe('Checkout & Delivery Address Validation', () => {
  const validAddress: Omit<DeliveryAddress, 'id'> = {
    fullName: 'Payel Acharya',
    phoneNumber: '9876543210',
    addressLine: '113/A, Natunpara',
    areaLocality: 'Muktapukur',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700123',
    landmark: 'Near Natunpara Pond',
    isDefault: true,
  }

  it('should validate a complete and valid Indian address', () => {
    const result = addressService.validateIndianAddress(validAddress)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })

  it('should reject invalid PIN code (not 6 digits)', () => {
    const result = addressService.validateIndianAddress({
      ...validAddress,
      pincode: '70012', // 5 digits
    })
    expect(result.isValid).toBe(false)
    expect(result.errors.pincode).toContain('6-digit')
  })

  it('should reject invalid mobile number (not 10 digits starting with 6-9)', () => {
    const result = addressService.validateIndianAddress({
      ...validAddress,
      phoneNumber: '12345',
    })
    expect(result.isValid).toBe(false)
    expect(result.errors.phoneNumber).toContain('10-digit')
  })

  it('should reject address with missing street line or name', () => {
    const result = addressService.validateIndianAddress({
      ...validAddress,
      fullName: '',
      addressLine: '',
    })
    expect(result.isValid).toBe(false)
    expect(result.errors.fullName).toBeDefined()
    expect(result.errors.addressLine).toBeDefined()
  })

  it('should fail order creation when cart is empty', async () => {
    const payload: CreateOrderPayload = {
      items: [],
      deliveryAddress: { ...validAddress, id: 'addr-1' },
      preferredDeliveryDate: '2026-08-25',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
      paymentMethod: 'UPI_QR',
    }

    await expect(orderService.createOrder(payload, 'test-customer')).rejects.toThrow(
      'Cannot create an order with an empty cart'
    )
  })

  it('should create order with correct subtotal, PBC- prefix, and AWAITING_PAYMENT status', async () => {
    const sampleProduct = CLIENT_PRODUCTS[0]
    const payload: CreateOrderPayload = {
      items: [
        {
          id: 'cart-1',
          productId: sampleProduct.id,
          name: sampleProduct.name,
          category: sampleProduct.category,
          image: sampleProduct.image,
          unitPrice: sampleProduct.price,
          weightOption: '500g',
          quantity: 2,
          isAvailable: true,
          subtotal: 2 * sampleProduct.price,
        },
      ],
      deliveryAddress: { ...validAddress, id: 'addr-1' },
      preferredDeliveryDate: '2026-08-25',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
      paymentMethod: 'UPI_QR',
    }

    const order = await orderService.createOrder(payload, 'test-customer')
    expect(order.id).toBeDefined()
    expect(order.orderNumber).toMatch(/^PBC-\d+$/)
    expect(order.subtotal).toBe(2 * sampleProduct.price)
    expect(order.grandTotal).toBe(2 * sampleProduct.price)
    expect(order.orderStatus).toBe('AWAITING_PAYMENT')
    expect(order.paymentStatus).toBe('PENDING')
  })
})
