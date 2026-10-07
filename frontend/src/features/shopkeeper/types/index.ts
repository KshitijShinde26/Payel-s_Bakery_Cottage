import type {
  Order as BaseOrder,
  OrderStatus,
  PaymentStatus,
  PaymentMethodType,
  DeliveryAddress,
  OrderItem,
} from '@/features/checkout/types'
import type {
  CustomCakeRequest as BaseCustomCakeRequest,
  CustomCakeStatus,
  CakeCategoryType,
  CakeFlavorType,
  CakeWeightType,
  DietaryPreference,
  DeliveryTimeWindow,
} from '@/features/customCake/types'
import type { Product, ProductCategory, CategoryInfo } from '@/features/catalog/types'

export type FeasibilityDecision = 'FEASIBLE' | 'MINOR_ADJUSTMENTS_REQUIRED' | 'NOT_FEASIBLE'

export interface Order extends BaseOrder {
  kitchenNotes?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export interface CustomCakeRequest extends BaseCustomCakeRequest {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  feasibilityDecision?: FeasibilityDecision | string
}

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

export interface ShopkeeperSummary {
  totalProducts: number
  availableProducts: number
  totalOrders: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  outForDeliveryOrders: number
  completedOrders: number
  pendingPayments: number
  pendingCustomCakes: number
  totalCustomCakes: number
  todayOrders: number
}

export type {
  OrderStatus,
  PaymentStatus,
  PaymentMethodType,
  DeliveryAddress,
  OrderItem,
  CustomCakeStatus,
  CakeCategoryType,
  CakeFlavorType,
  CakeWeightType,
  DietaryPreference,
  DeliveryTimeWindow,
  Product,
  ProductCategory,
  CategoryInfo,
}
