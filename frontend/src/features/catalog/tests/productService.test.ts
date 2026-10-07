import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productService, CLIENT_PRODUCTS, CATEGORIES } from '../services/productService'
import { apiClient } from '@/lib/apiClient'

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Product Service & Catalog Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url === '/products') {
        return { data: [...CLIENT_PRODUCTS] }
      }
      if (url.startsWith('/products/cat-') || url === '/products/categories') {
        return { data: [...CATEGORIES] }
      }
      if (url === '/products/featured') {
        return { data: CLIENT_PRODUCTS.filter((p) => p.isFeatured) }
      }
      if (url === '/products/bestsellers') {
        return { data: CLIENT_PRODUCTS.filter((p) => p.isBestseller) }
      }
      if (url === '/products/prod-1') {
        return { data: CLIENT_PRODUCTS[0] }
      }
      if (url === '/products/non-existent-id') {
        throw new Error('Not found')
      }
      return { data: [] }
    })
  })

  it('should return all products when no filters applied', async () => {
    const products = await productService.getProducts()
    expect(products.length).toBe(CLIENT_PRODUCTS.length)
  })

  it('should return empty list when API returns empty array', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] })
    const products = await productService.getProducts()
    expect(products).toEqual([])
  })

  it('should return empty list on API failure without returning fake data', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'))
    const products = await productService.getProducts()
    expect(products).toEqual([])
  })

  it('should retrieve individual product details by ID', async () => {
    const product = await productService.getProductById('prod-1')
    expect(product).not.toBeNull()
    expect(product?.name).toBe('Traditional Rich Plum & Dry Fruit Cake')
    expect(product?.isEggless).toBe(true)
  })

  it('should return null for non-existent product ID', async () => {
    const product = await productService.getProductById('non-existent-id')
    expect(product).toBeNull()
  })

  it('should return all available categories', async () => {
    const categories = await productService.getCategories()
    expect(categories.length).toBe(CATEGORIES.length)
    expect(categories.map((c) => c.name)).toContain('Cakes')
    expect(categories.map((c) => c.name)).toContain('Customized Cakes')
  })

  it('should return featured products', async () => {
    const featured = await productService.getFeaturedProducts()
    expect(featured.length).toBeGreaterThan(0)
    featured.forEach((p) => expect(p.isFeatured).toBe(true))
  })

  it('should return bestseller products', async () => {
    const bestsellers = await productService.getBestSellers()
    expect(bestsellers.length).toBeGreaterThan(0)
    bestsellers.forEach((p) => expect(p.isBestseller).toBe(true))
  })
})
