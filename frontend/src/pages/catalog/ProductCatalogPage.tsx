import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '@/features/catalog/services/productService'
import type { Product, CategoryInfo, SortOption } from '@/features/catalog/types'
import { ProductCard } from '@/components/catalog/ProductCard'
import { SkeletonCard } from '@/components/catalog/SkeletonCard'
import { Button } from '@/components/ui/Button'
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react'


export const ProductCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filter state extracted from URL or defaults
  const currentCategory = searchParams.get('category') || 'All'
  const currentSearch = searchParams.get('search') || ''
  const currentSort = (searchParams.get('sort') as SortOption) || 'popular'
  const currentMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0
  const currentMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 3000
  const onlyAvailable = searchParams.get('available') === 'true'

  // Fetch initial categories and products
  useEffect(() => {
    document.title = 'All Bakery Products | Payal\'s Bakery Cottage'
    const loadCategories = async () => {
      try {
        const cats = await productService.getCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    loadCategories()
  }, [])

  // Fetch filtered products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const result = await productService.getProducts({
          category: currentCategory === 'All' ? undefined : currentCategory,
          search: currentSearch || undefined,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
          isAvailable: onlyAvailable ? true : undefined,
          sortBy: currentSort,
        })
        setProducts(result)
      } catch (err) {
        console.error('Failed to load products', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, onlyAvailable])

  // Helper to update search params
  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === null || value === '' || (key === 'category' && value === 'All')) {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (currentCategory !== 'All') count++
    if (currentSearch) count++
    if (currentMinPrice > 0 || currentMaxPrice < 3000) count++
    if (onlyAvailable) count++
    return count
  }, [currentCategory, currentSearch, currentMinPrice, currentMaxPrice, onlyAvailable])

  return (
    <div className="min-h-screen bg-stone-50/50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
                Homemade Menu
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
                {currentCategory === 'All' ? 'All Bakery Products' : currentCategory}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-500">
                100% Eggless artisan bakes crafted fresh in Barrackpore, Kolkata.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search cakes, pastries, cookies..."
                value={currentSearch}
                onChange={(e) => updateParam('search', e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-amber-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              {currentSearch && (
                <button
                  type="button"
                  onClick={() => updateParam('search', null)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Quick Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => updateParam('category', 'All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentCategory === 'All'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-amber-100 hover:bg-amber-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam('category', cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  currentCategory === cat.name
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-amber-100 hover:bg-amber-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 rounded-2xl bg-white p-6 border border-amber-100/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-amber-700" />
                  <h2 className="text-sm font-bold font-serif text-stone-900">Filters</h2>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Maximum Price (₹{currentMaxPrice})
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={currentMaxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-500 font-medium mt-1">
                  <span>₹100</span>
                  <span>₹1,500</span>
                  <span>₹3,000</span>
                </div>
              </div>

              {/* Dietary & Stock Availability */}
              <div className="border-t border-stone-100 pt-4 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Dietary & Stock
                </label>
                <div className="flex items-center justify-between text-xs text-stone-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    100% Eggless
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Strict Standard
                  </span>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => updateParam('available', e.target.checked ? 'true' : null)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>Show In-Stock Only</span>
                </label>
              </div>

              {/* Lead Time notice */}
              <div className="border-t border-stone-100 pt-4 bg-amber-50/30 p-3 rounded-xl">
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  <strong>Freshly Baked:</strong> Custom celebration cakes require 24–48 hours preparation lead time.
                </p>
              </div>
            </div>
          </aside>

          {/* Product Listing Area */}
          <main className="lg:col-span-3">
            {/* Action Bar (Sorting & Mobile Filter Button) */}
            <div className="mb-6 flex items-center justify-between bg-white p-3.5 rounded-2xl border border-amber-100/80 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                </button>
                <span className="text-xs text-stone-500 font-medium">
                  Showing <strong>{products.length}</strong> bakes
                </span>
              </div>

              {/* Sorting selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                <label htmlFor="sort-select" className="text-xs text-stone-500 font-medium hidden sm:inline">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={currentSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="text-xs font-semibold rounded-xl border border-amber-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-amber-100 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  No Bakery Products Found
                </h3>
                <p className="mt-2 text-xs text-stone-500 max-w-sm">
                  We couldn't find any cakes or bakes matching "{currentSearch || currentCategory}". Try searching for something else or clear active filters.
                </p>
                <Button
                  onClick={handleClearFilters}
                  variant="primary"
                  size="sm"
                  className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-xs bg-white p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-amber-700" />
                  <h3 className="text-base font-bold font-serif text-stone-900">Filter Menu</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Price Slider */}
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Max Price: ₹{currentMaxPrice}
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={currentMaxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Mobile Available Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-2.5 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => updateParam('available', e.target.checked ? 'true' : null)}
                    className="rounded border-amber-300 text-amber-600 h-4 w-4"
                  />
                  <span>In-Stock Only</span>
                </label>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-1/2 text-xs rounded-xl"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 bg-amber-600 text-white rounded-xl text-xs"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default ProductCatalogPage
