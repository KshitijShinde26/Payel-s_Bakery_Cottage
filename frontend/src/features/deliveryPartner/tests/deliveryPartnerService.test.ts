import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deliveryPartnerService } from '../services/deliveryPartnerService'
import { apiClient } from '@/lib/apiClient'

describe('DeliveryPartnerService API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch dashboard summary telemetry', async () => {
    const mockSummary = {
      assignedDeliveries: 10,
      pickupsPending: 2,
      outForDelivery: 3,
      deliveredToday: 5,
      failedDeliveries: 1,
      todayOrders: [],
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockSummary } as any)

    const result = await deliveryPartnerService.getDashboardSummary()
    expect(apiClient.get).toHaveBeenCalledWith('/delivery-partner/dashboard')
    expect(result.assignedDeliveries).toBe(10)
    expect(result.deliveredToday).toBe(5)
  })

  it('should fetch assigned orders', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-1001',
        orderStatus: 'OUT_FOR_DELIVERY',
        deliveryOtp: '123456',
        items: [],
      },
    ]
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockOrders } as any)

    const result = await deliveryPartnerService.getAssignedOrders()
    expect(apiClient.get).toHaveBeenCalledWith('/delivery-partner/orders')
    expect(result).toEqual(mockOrders)
  })

  it('should start delivery and trigger OTP generation', async () => {
    const mockUpdated = {
      id: 'order-1',
      orderNumber: 'ORD-1001',
      orderStatus: 'OUT_FOR_DELIVERY',
      deliveryOtp: '654321',
    }
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: mockUpdated } as any)

    const result = await deliveryPartnerService.startDelivery('order-1')
    expect(apiClient.patch).toHaveBeenCalledWith('/delivery-partner/orders/order-1/out-for-delivery')
    expect(result.orderStatus).toBe('OUT_FOR_DELIVERY')
  })

  it('should verify OTP and confirm delivery', async () => {
    const mockCompleted = {
      id: 'order-1',
      orderNumber: 'ORD-1001',
      orderStatus: 'DELIVERED',
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockCompleted } as any)

    const result = await deliveryPartnerService.confirmDelivery('order-1', { otp: '654321' })
    expect(apiClient.post).toHaveBeenCalledWith('/delivery-partner/orders/order-1/deliver', {
      otp: '654321',
    })
    expect(result.orderStatus).toBe('DELIVERED')
  })

  it('should report delivery failure with reason notes', async () => {
    const mockFailed = {
      id: 'order-1',
      orderNumber: 'ORD-1001',
      orderStatus: 'DELIVERY_FAILED',
      deliveryFailureReason: 'Customer door locked',
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockFailed } as any)

    const result = await deliveryPartnerService.reportDeliveryFailure('order-1', {
      reason: 'Customer door locked',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/delivery-partner/orders/order-1/delivery-failed', {
      reason: 'Customer door locked',
    })
    expect(result.orderStatus).toBe('DELIVERY_FAILED')
  })

  it('should update profile details', async () => {
    const mockProfile = {
      userId: 'user-1',
      fullName: 'Updated Driver',
      serviceArea: 'Kalyani Nagar',
      vehicleType: 'EV Bike',
      vehicleNumber: 'MH-12-EV-9999',
      phoneNumber: '9876543210',
      email: 'driver@bakery.com',
      enabled: true,
      activeDeliveriesCount: 1,
      completedDeliveriesCount: 20,
    }
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: mockProfile } as any)

    const payload = {
      fullName: 'Updated Driver',
      phoneNumber: '9876543210',
      serviceArea: 'Kalyani Nagar',
      vehicleType: 'EV Bike',
      vehicleNumber: 'MH-12-EV-9999',
      emergencyContact: '9876543211',
    }

    const result = await deliveryPartnerService.updateProfile(payload)
    expect(apiClient.put).toHaveBeenCalledWith('/delivery-partner/profile', payload)
    expect(result.serviceArea).toBe('Kalyani Nagar')
  })
})
