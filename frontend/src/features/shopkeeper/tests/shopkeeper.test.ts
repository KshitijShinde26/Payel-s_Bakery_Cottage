import { describe, it, expect, beforeEach } from 'vitest'
import { shopkeeperService } from '../services/shopkeeperService'

describe('Shopkeeper Service Operations', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should fetch initial active kitchen orders', async () => {
    const orders = await shopkeeperService.getOrders()
    expect(orders).toBeDefined()
    expect(orders.length).toBeGreaterThan(0)
    expect(orders[0]).toHaveProperty('orderNumber')
    expect(orders[0]).toHaveProperty('orderStatus')
  })

  it('should filter orders by status', async () => {
    const preparingOrders = await shopkeeperService.getOrders('PREPARING')
    expect(preparingOrders.every((o) => o.orderStatus === 'PREPARING')).toBe(true)
  })

  it('should transition order status to READY and OUT_FOR_DELIVERY', async () => {
    const orders = await shopkeeperService.getOrders()
    const targetOrder = orders[0]

    const updatedReady = await shopkeeperService.updateOrderStatus(targetOrder.id, {
      status: 'READY',
      kitchenNotes: 'Baked to perfection and boxed.',
    })
    expect(updatedReady.orderStatus).toBe('READY')

    const updatedDispatched = await shopkeeperService.updateOrderStatus(targetOrder.id, {
      status: 'OUT_FOR_DELIVERY',
    })
    expect(updatedDispatched.orderStatus).toBe('OUT_FOR_DELIVERY')
  })

  it('should fetch and review custom cake requests with pricing and notes', async () => {
    const customCakes = await shopkeeperService.getCustomCakes()
    expect(customCakes.length).toBeGreaterThan(0)
    const cakeToReview = customCakes[0]

    const reviewed = await shopkeeperService.reviewCustomCake(cakeToReview.id, {
      status: 'APPROVED',
      confirmedPrice: 2450,
      feasibilityDecision: 'FEASIBLE',
      bakeryNotes: 'Tier support structure confirmed.',
    })

    expect(reviewed.status).toBe('APPROVED')
    expect(reviewed.confirmedPrice).toBe(2450)
    expect(reviewed.bakeryNotes).toBe('Tier support structure confirmed.')
  })
})
