import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from '../services/adminService'
import { apiClient } from '@/lib/apiClient'

describe('Admin Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch admin summary', async () => {
    const mockSummary = {
      totalRevenue: 15420,
      todayRevenue: 2450,
      totalOrders: 42,
      todayOrders: 5,
      activeOrders: 3,
      totalUsers: 18,
      totalCustomers: 15,
      totalShopkeepers: 2,
      pendingCakes: 1,
      totalProducts: 25,
      outOfStockProducts: 2,
      pendingPayments: 2,
    }

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockSummary } as any)

    const summary = await adminService.getSummary()
    expect(summary.totalRevenue).toBe(15420)
    expect(summary.pendingPayments).toBe(2)
  })

  it('should fetch payments and pending payments', async () => {
    const mockPayments = [
      {
        id: 'pay-1',
        orderId: 'order-1',
        paymentMethod: 'UPI',
        amount: 850,
        status: 'VERIFICATION_REQUIRED',
        transactionRef: 'UPI9876543210',
        createdAt: '2026-08-01T10:00:00Z',
      },
    ]

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockPayments } as any)

    const payments = await adminService.getPayments()
    expect(payments).toHaveLength(1)
    expect(payments[0].transactionRef).toBe('UPI9876543210')
  })

  it('should verify payment successfully', async () => {
    const mockVerified = {
      id: 'pay-1',
      orderId: 'order-1',
      paymentMethod: 'UPI',
      amount: 850,
      status: 'PAID',
      transactionRef: 'UPI9876543210',
      createdAt: '2026-08-01T10:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockVerified } as any)

    const result = await adminService.verifyPayment('pay-1')
    expect(result.status).toBe('PAID')
  })

  it('should reject payment with reason', async () => {
    const mockRejected = {
      id: 'pay-1',
      orderId: 'order-1',
      paymentMethod: 'UPI',
      amount: 850,
      status: 'REJECTED',
      rejectionReason: 'Invalid UTR format',
      createdAt: '2026-08-01T10:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockRejected } as any)

    const result = await adminService.rejectPayment('pay-1', 'Invalid UTR format')
    expect(result.status).toBe('REJECTED')
  })

  it('should update order status', async () => {
    const mockOrder = {
      id: 'order-1',
      orderStatus: 'PREPARING',
      kitchenNotes: 'Extra sprinkles added',
    }

    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: mockOrder } as any)

    const result = await adminService.updateOrderStatus('order-1', {
      status: 'PREPARING',
      kitchenNotes: 'Extra sprinkles added',
    })
    expect(result.orderStatus).toBe('PREPARING')
  })
})
