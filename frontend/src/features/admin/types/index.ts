import type { RoleType } from '@/features/auth/types'
import type { Order, OrderStatus, CustomCakeRequest, CustomCakeStatus, FeasibilityDecision } from '@/features/shopkeeper/types'

export interface DailySales {
  date: string
  day: string
  amount: number
  orderCount: number
}

export interface AdminSummary {
  totalRevenue: number
  todayRevenue: number
  monthlyRevenue: number
  totalOrders: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  outForDeliveryOrders: number
  completedOrders: number
  cancelledOrders: number
  pendingPayments: number
  totalUsers: number
  totalCustomers: number
  totalShopkeepers: number
  totalAdmins: number
  pendingCustomCakes: number
  totalCustomCakes: number
  weeklySales: DailySales[]
}

export interface AdminUser {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: RoleType
  emailVerified: boolean
  enabled?: boolean
  avatarUrl?: string
  createdAt?: string
}

export interface AuditLog {
  id: string
  eventType: string
  email: string
  details?: string
  ipAddress?: string
  timestamp: string
}

export type { Order, OrderStatus, CustomCakeRequest, CustomCakeStatus, FeasibilityDecision }
