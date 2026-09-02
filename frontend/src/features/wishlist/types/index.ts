import type { Product } from '@/features/catalog/types'

export interface WishlistItem {
  id: string
  productId: string
  product: Product
  addedAt: string
}
