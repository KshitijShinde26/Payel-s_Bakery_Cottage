import type { OrderStatus, PaymentStatus } from '@/features/checkout/types'

export interface DeliveryPartnerProfile {
  id: string
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  serviceArea: string
  vehicleType?: string
  vehicleNumber?: string
  emergencyContact?: string
  status: 'ACTIVE' | 'INACTIVE'
  enabled: boolean
  avatarUrl?: string
  activeDeliveriesCount: number
  completedDeliveriesCount: number
  createdAt?: string
}

export interface DeliveryAddress {
  fullName: string
  phoneNumber: string
  addressLine: string
  areaLocality: string
  city: string
  state: string
  pincode: string
  landmark?: string
}

export interface DeliveryOrderItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  category?: string
  weightOption?: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface DeliveryOrder {
  id: string
  orderNumber: string
  userId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  subtotal: number
  deliveryChargeText?: string
  grandTotal: number
  deliveryAddress: DeliveryAddress
  preferredDeliveryDate?: string
  preferredDeliveryTime?: string
  paymentMethod: string
  orderStatus: OrderStatus | 'DELIVERY_FAILED'
  paymentStatus: PaymentStatus
  kitchenNotes?: string
  deliveryPartnerId?: string
  deliveryPartnerName?: string
  deliveryPartnerPhone?: string
  assignedAt?: string
  outForDeliveryAt?: string
  deliveredAt?: string
  deliveryOtp?: string
  deliveryFailureReason?: string
  deliveryNotes?: string
  createdAt: string
  updatedAt?: string
  items: DeliveryOrderItem[]
}

export interface DeliveryPartnerSummary {
  assignedDeliveries: number
  pickupsPending: number
  outForDelivery: number
  deliveredToday: number
  failedDeliveries: number
  todayOrders: DeliveryOrder[]
  partnerProfile?: DeliveryPartnerProfile
}

export interface CreateDeliveryPartnerPayload {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  serviceArea: string
  vehicleType?: string
  vehicleNumber?: string
  emergencyContact?: string
}

export interface UpdateDeliveryPartnerPayload {
  fullName?: string
  phoneNumber?: string
  serviceArea?: string
  vehicleType?: string
  vehicleNumber?: string
  emergencyContact?: string
  status?: string
  enabled?: boolean
}

export interface AssignDeliveryPartnerPayload {
  deliveryPartnerId: string
  deliveryNotes?: string
}

export interface DeliveryFailurePayload {
  reason: string
  notes?: string
}

export interface DeliveryOtpPayload {
  otp: string
}

export interface AdminDeliveryAnalytics {
  totalPartners: number
  activePartners: number
  inactivePartners: number
  ordersAwaitingAssignment: number
  ordersOutForDelivery: number
  deliveriesCompletedToday: number
  failedDeliveries: number
}
