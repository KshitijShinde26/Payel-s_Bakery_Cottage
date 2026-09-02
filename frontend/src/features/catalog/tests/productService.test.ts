import { describe, it, expect } from 'vitest'
import { productService, CLIENT_PRODUCTS, CATEGORIES } from '../services/productService'

describe('Product Service & Catalog Functionality', () => {
  it('should return all products when no filters applied', async () => {
    const products = await productService.getProducts()
    expect(products.length).toBe(CLIENT_PRODUCTS.length)
  })

  it('should filter products by category', async () => {
    const cakes = await productService.getProducts({ category: 'Cakes' })
    expect(cakes.length).toBeGreaterThan(0)
    cakes.forEach((p) => {
      expect(p.category).toBe('Cakes')
    })
  })

  it('should search products by query string', async () => {
    const results = await productService.getProducts({ search: 'chocolate' })
    expect(results.length).toBeGreaterThan(0)
    results.forEach((p) => {
      const match =
        p.name.toLowerCase().includes('chocolate') ||
        p.description.toLowerCase().includes('chocolate') ||
        p.shortDescription.toLowerCase().includes('chocolate') ||
        p.category.toLowerCase().includes('chocolate')
      expect(match).toBe(true)
    })
  })

  it('should filter products by price range', async () => {
    const max = 500
    const filtered = await productService.getProducts({ maxPrice: max })
    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach((p) => {
      expect(p.price).toBeLessThanOrEqual(max)
    })
  })

  it('should sort products by price ascending', async () => {
    const sorted = await productService.getProducts({ sortBy: 'price-asc' })
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price)
    }
  })

  it('should sort products by price descending', async () => {
    const sorted = await productService.getProducts({ sortBy: 'price-desc' })
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i + 1].price)
    }
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
