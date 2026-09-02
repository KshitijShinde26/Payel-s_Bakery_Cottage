import type { Product } from '@/features/catalog/types'

export interface CartItem {
  id: string
  productId: string
  name: string
  category: string
  image: string
  unitPrice: number
  weightOption: string
  quantity: number
  isAvailable: boolean
  subtotal: number
}

export interface CartSummary {
  subtotal: number
  totalItems: number
  totalUniqueItems: number
  grandTotal: number
}

export interface AddToCartPayload {
  product: Product
  weightOption?: string
  quantity?: number
}
