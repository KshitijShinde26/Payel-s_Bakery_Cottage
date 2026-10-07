import { describe, it, expect, vi, beforeEach } from 'vitest'
import { customerService } from '../services/customerService'
import { apiClient } from '@/lib/apiClient'

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Customer Service Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch customer dashboard summary from backend', async () => {
    const mockSummary = {
      customerId: 'cust-123',
      fullName: 'Anita Sharma',
      email: 'anita@example.com',
      phoneNumber: '9876543210',
      totalOrdersCount: 4,
      activeOrdersCount: 1,
      completedOrdersCount: 3,
      customCakesCount: 2,
      pendingCustomCakesCount: 1,
      pendingPaymentsCount: 0,
      recentOrders: [],
      recentCustomCakes: [],
      featuredProducts: [],
      bestSellers: [],
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSummary })

    const result = await customerService.getDashboardSummary()
    expect(apiClient.get).toHaveBeenCalledWith('/customer/summary')
    expect(result.fullName).toBe('Anita Sharma')
    expect(result.activeOrdersCount).toBe(1)
    expect(result.totalOrdersCount).toBe(4)
  })

  it('should fetch customer orders from backend', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'PBC-101',
        userId: 'cust-123',
        grandTotal: 750,
        orderStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        items: [],
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockOrders })

    const result = await customerService.getOrders()
    expect(apiClient.get).toHaveBeenCalledWith('/customer/orders')
    expect(result).toHaveLength(1)
    expect(result[0].orderNumber).toBe('PBC-101')
  })

  it('should submit 12-digit UTR payment for verification', async () => {
    const mockPayload = {
      orderId: 'order-1',
      amount: 750,
      paymentMethod: 'UPI_QR',
      transactionRef: '423589124501',
    }

    const mockResponse = {
      id: 'pay-1',
      orderId: 'order-1',
      orderNumber: 'PBC-101',
      amount: 750,
      paymentMethod: 'UPI_QR',
      status: 'VERIFICATION_REQUIRED',
      transactionRef: '423589124501',
      createdAt: '2026-09-06T12:00:00Z',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse })

    const result = await customerService.submitPayment(mockPayload)
    expect(apiClient.post).toHaveBeenCalledWith('/customer/payments/submit', mockPayload)
    expect(result.status).toBe('VERIFICATION_REQUIRED')
    expect(result.transactionRef).toBe('423589124501')
  })
})
