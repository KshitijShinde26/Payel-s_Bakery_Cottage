import type { Order } from '@/features/checkout/types'
import type { CustomCakeRequest } from '@/features/customCake/types'
import type { Product } from '@/features/catalog/types'

export interface CustomerDashboardSummary {
  customerId: string
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl?: string
  memberSince: string

  totalOrdersCount: number
  activeOrdersCount: number
  completedOrdersCount: number
  customCakesCount: number
  pendingCustomCakesCount: number
  pendingPaymentsCount: number

  recentOrders: Order[]
  recentCustomCakes: CustomCakeRequest[]
  featuredProducts: Product[]
  bestSellers: Product[]
}

export interface CustomerPayment {
  id: string
  orderId: string
  orderNumber: string
  amount: number
  paymentMethod: string
  status: 'PENDING' | 'VERIFICATION_REQUIRED' | 'PAID' | 'REJECTED'
  transactionRef?: string
  createdAt: string
  verifiedAt?: string
}

export interface SubmitPaymentPayload {
  orderId: string
  amount: number
  paymentMethod: string
  transactionRef: string
  receiptImageUrl?: string
}
