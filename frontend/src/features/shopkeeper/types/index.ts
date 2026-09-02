import type { Order, OrderStatus } from '@/features/checkout/types'
import type { CustomCakeRequest, CustomCakeStatus } from '@/features/customCake/types'

export type FeasibilityDecision = 'FEASIBLE' | 'MINOR_ADJUSTMENTS_REQUIRED' | 'NOT_FEASIBLE'

export interface UpdateOrderStatusPayload {
  status: OrderStatus
  kitchenNotes?: string
}

export interface ReviewCustomCakePayload {
  status: CustomCakeStatus
  confirmedPrice?: number
  estimatedPrice?: number
  feasibilityDecision: FeasibilityDecision
  bakeryNotes?: string
}

export interface ShopkeeperStats {
  todayTotal: number
  inPreparation: number
  pendingCustomCakes: number
  readyForDispatch: number
  outForDelivery: number
  completedToday: number
}

export type { Order, OrderStatus, CustomCakeRequest, CustomCakeStatus }
