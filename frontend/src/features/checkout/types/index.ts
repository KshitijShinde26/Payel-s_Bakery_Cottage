import type { CartItem } from '@/features/cart/types'

export interface DeliveryAddress {
  id: string
  fullName: string
  phoneNumber: string
  addressLine: string
  areaLocality: string
  city: string
  state: string
  pincode: string
  landmark?: string
  isDefault?: boolean
}

export type DeliveryTimeSlot =
  | 'Morning (10:00 AM – 01:00 PM)'
  | 'Afternoon (01:00 PM – 05:00 PM)'
  | 'Evening (05:00 PM – 08:00 PM)'

export type PaymentMethodType = 'UPI_QR' | 'CASH_ON_DELIVERY'

export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_VERIFIED'
  | 'AWAITING_BAKERY_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  category: string
  weightOption: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  deliveryChargeText: string
  grandTotal: number
  deliveryAddress: DeliveryAddress
  preferredDeliveryDate: string
  preferredDeliveryTime: DeliveryTimeSlot
  paymentMethod: PaymentMethodType
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  items: CartItem[]
  deliveryAddress: DeliveryAddress
  preferredDeliveryDate: string
  preferredDeliveryTime: DeliveryTimeSlot
  paymentMethod: PaymentMethodType
}
