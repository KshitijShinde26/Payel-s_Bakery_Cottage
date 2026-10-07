import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shopkeeperService } from '../services/shopkeeperService'
import { apiClient } from '@/lib/apiClient'
import type { Order, CustomCakeRequest, ShopkeeperSummary } from '../types'

describe('Shopkeeper Service Real API Operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch shopkeeper dashboard summary metrics from backend', async () => {
    const mockSummary: ShopkeeperSummary = {
      totalProducts: 5,
      availableProducts: 4,
      totalOrders: 2,
      pendingOrders: 1,
      preparingOrders: 1,
      readyOrders: 0,
      outForDeliveryOrders: 0,
      completedOrders: 0,
      pendingPayments: 1,
      pendingCustomCakes: 1,
      totalCustomCakes: 1,
      todayOrders: 2,
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockSummary })

    const summary = await shopkeeperService.getSummary()
    expect(summary).toEqual(mockSummary)
  })

  it('should return 0-filled summary metrics on API error rather than mock numbers', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error'))

    const summary = await shopkeeperService.getSummary()
    expect(summary.totalOrders).toBe(0)
    expect(summary.totalProducts).toBe(0)
    expect(summary.totalCustomCakes).toBe(0)
  })

  it('should fetch read-only product catalog from backend and return empty array if none exist', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [] })

    const products = await shopkeeperService.getProducts()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBe(0)
  })

  it('should fetch active kitchen orders from backend', async () => {
    const mockOrder: Order = {
      id: 'ord-test-1',
      orderNumber: 'PBC-999901',
      userId: 'user-test',
      items: [
        {
          productId: 'prod-01',
          productName: 'Truffle Cake',
          productImage: '/images/Product_1.jpeg',
          category: 'Cakes',
          weightOption: '1.0 kg',
          unitPrice: 850,
          quantity: 1,
          subtotal: 850,
        },
      ],
      subtotal: 850,
      deliveryChargeText: 'Free Delivery',
      grandTotal: 850,
      deliveryAddress: {
        id: 'addr-1',
        fullName: 'Real Customer',
        phoneNumber: '+91 98765 00000',
        addressLine: '123 Real Street',
        areaLocality: 'Kothrud',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038',
      },
      preferredDeliveryDate: '2026-08-25',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
      paymentMethod: 'UPI_QR',
      orderStatus: 'PREPARING',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [mockOrder] })

    const orders = await shopkeeperService.getOrders()
    expect(orders).toHaveLength(1)
    expect(orders[0].orderNumber).toBe('PBC-999901')
    expect(orders[0].orderStatus).toBe('PREPARING')
  })

  it('should transition order status to READY via backend API', async () => {
    const updatedOrder: Order = {
      id: 'ord-test-1',
      orderNumber: 'PBC-999901',
      userId: 'user-test',
      items: [],
      subtotal: 850,
      deliveryChargeText: 'Free Delivery',
      grandTotal: 850,
      deliveryAddress: {
        id: 'addr-1',
        fullName: 'Real Customer',
        phoneNumber: '+91 98765 00000',
        addressLine: '123 Real Street',
        areaLocality: 'Kothrud',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038',
      },
      preferredDeliveryDate: '2026-08-25',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
      paymentMethod: 'UPI_QR',
      orderStatus: 'READY',
      paymentStatus: 'PAID',
      kitchenNotes: 'Baked to perfection and boxed.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: updatedOrder })

    const res = await shopkeeperService.updateOrderStatus('ord-test-1', {
      status: 'READY',
      kitchenNotes: 'Baked to perfection and boxed.',
    })
    expect(res.orderStatus).toBe('READY')
    expect(res.kitchenNotes).toBe('Baked to perfection and boxed.')
  })

  it('should fetch and review real custom cake requests via backend API', async () => {
    const mockCake: CustomCakeRequest = {
      id: 'custom-cake-real-1',
      userId: 'user-101',
      customerName: 'Real Customer',
      customerPhone: '+91 98220 00000',
      customerEmail: 'customer@example.com',
      cakeType: 'Birthday Cake',
      flavor: 'Chocolate Truffle',
      weight: '2.0 kg',
      dietaryPreference: 'Eggless',
      referenceImageUrl: '/images/Product_1.jpeg',
      referenceImageName: 'ref.jpg',
      referenceImageSize: 10240,
      preferredDeliveryDate: '2026-08-28',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [mockCake] })

    const cakes = await shopkeeperService.getCustomCakes()
    expect(cakes).toHaveLength(1)

    const reviewedCake: CustomCakeRequest = {
      ...mockCake,
      status: 'APPROVED',
      confirmedPrice: 2450,
      feasibilityDecision: 'FEASIBLE',
      bakeryNotes: 'Confirmed.',
    }
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: reviewedCake })

    const reviewed = await shopkeeperService.reviewCustomCake('custom-cake-real-1', {
      status: 'APPROVED',
      confirmedPrice: 2450,
      feasibilityDecision: 'FEASIBLE',
      bakeryNotes: 'Confirmed.',
    })

    expect(reviewed.status).toBe('APPROVED')
    expect(reviewed.confirmedPrice).toBe(2450)
  })
})
