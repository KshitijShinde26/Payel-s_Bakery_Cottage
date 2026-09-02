import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '@/features/catalog/services/productService'
import type { Product, CategoryInfo } from '@/features/catalog/types'
import { ProductCard } from '@/components/catalog/ProductCard'
import { SkeletonCard } from '@/components/catalog/SkeletonCard'
import { Button } from '@/components/ui/Button'
import { ChevronRight, Layers, Sparkles } from 'lucide-react'

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const loadCategoryData = async () => {
      if (!category) return
      setLoading(true)
      try {
        const decoded = decodeURIComponent(category)
        document.title = `${decoded} | Payal's Bakery Cottage`

        const [allCats, catProducts] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ category: decoded }),
        ])

        const matched = allCats.find(
          (c) => c.name.toLowerCase() === decoded.toLowerCase() || c.slug.toLowerCase() === decoded.toLowerCase()
        )
        setCategoryInfo(matched || null)
        setProducts(catProducts)
      } catch (err) {
        console.error('Failed to load category data', err)
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [category])

  const categoryName = categoryInfo ? categoryInfo.name : decodeURIComponent(category || '')

  return (
    <div className="min-h-screen bg-stone-50/50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-amber-800 transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800">{categoryName}</span>
        </nav>

        {/* Category Header Banner */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-amber-800 to-amber-950 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              100% Eggless Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">{categoryName}</h1>
            <p className="mt-3 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              {categoryInfo?.description ||
                `Explore our handcrafted, freshly baked selection of ${categoryName.toLowerCase()} prepared with love.`}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-stone-500 font-medium">
            Found <strong>{products.length}</strong> items in {categoryName}
          </p>
          <Link
            to="/products"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-amber-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-stone-900">
              No products found in this category
            </h3>
            <p className="mt-2 text-xs text-stone-500 max-w-sm">
              We are currently preparing fresh batches. Check back shortly or browse our full bakery catalog.
            </p>
            <Link to="/products" className="mt-6">
              <Button variant="primary" size="sm" className="bg-amber-600 text-white rounded-xl">
                Browse All Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
export default CategoryPage
