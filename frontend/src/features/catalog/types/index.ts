export type ProductCategory =
  | 'Cakes'
  | 'Pastries'
  | 'Breads'
  | 'Cookies'
  | 'Cupcakes'
  | 'Customized Cakes'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  originalPrice?: number
  description: string
  shortDescription: string
  image: string
  gallery?: string[]
  isEggless: boolean
  isAvailable: boolean
  isBestseller?: boolean
  isFeatured?: boolean
  shelfLife?: string
  allergens?: string[]
  ingredients?: string[]
  weightOptions?: string[]
  minLeadTimeHours?: number
  rating?: number
  reviewCount?: number
}

export interface CategoryInfo {
  id: string
  name: ProductCategory
  slug: string
  description: string
  image: string
  itemCount: number
}

export type SortOption =
  | 'popular'
  | 'price-asc'
  | 'price-desc'
  | 'newest'

export interface ProductFilterParams {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  isEggless?: boolean
  isAvailable?: boolean
  sortBy?: SortOption
}
