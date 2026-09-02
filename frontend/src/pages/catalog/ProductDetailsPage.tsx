import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '@/features/catalog/services/productService'

import type { Product } from '@/features/catalog/types'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/features/cart/hooks/useCart'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import {
  Heart,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Plus,
  Minus,
  Star,
} from 'lucide-react'

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedWeight, setSelectedWeight] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)

  const isWishlisted = product ? isInWishlist(product.id) : false

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const fetchProductDetails = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await productService.getProductById(id)
        if (data) {
          setProduct(data)
          setSelectedImage(data.image)
          if (data.weightOptions && data.weightOptions.length > 0) {
            setSelectedWeight(data.weightOptions[0])
          }
          document.title = `${data.name} | Payal's Bakery Cottage`

          // Fetch related products in the same category
          const related = await productService.getProducts({
            category: data.category,
          })
          setRelatedProducts(related.filter((p) => p.id !== data.id).slice(0, 3))
        } else {
          setProduct(null)
          document.title = "Product Not Found | Payal's Bakery Cottage"
        }
      } catch (err) {
        console.error('Failed to load product details', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [id])

  const handleAddToCart = async () => {
    if (!product || !product.isAvailable) return
    await addToCart({
      product,
      weightOption: selectedWeight || product.weightOptions?.[0] || 'Standard',
      quantity,
    })
  }

  const handleToggleWishlist = async () => {
    if (!product) return
    if (isWishlisted) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
            <div className="lg:col-span-6 aspect-square bg-amber-100/60 rounded-3xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-4 w-1/4 bg-amber-100 rounded" />
              <div className="h-8 w-3/4 bg-amber-200/70 rounded" />
              <div className="h-6 w-1/3 bg-amber-200/70 rounded" />
              <div className="h-24 bg-stone-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold font-serif text-stone-900">Product Not Found</h1>
        <p className="mt-2 text-xs text-stone-500 max-w-sm">
          The bakery product you are looking for might have been retired or does not exist.
        </p>
        <Link to="/products" className="mt-6">
          <Button variant="primary" className="bg-amber-600 text-white rounded-xl">
            Browse All Bakes
          </Button>
        </Link>
      </div>
    )
  }

  const galleryList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image]

  return (
    <div className="min-h-screen bg-stone-50/40 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-amber-800 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-amber-800 transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-amber-100/80 shadow-xs">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-100 shadow-inner">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/images/Logo.jpeg'
                }}
              />

              {/* Status Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isEggless && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/95 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                    100% Eggless
                  </span>
                )}
                {product.isBestseller && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600/95 px-3 py-1 text-xs font-bold text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bestseller
                  </span>
                )}
              </div>

              {!product.isAvailable && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold text-white uppercase tracking-wider shadow-lg">
                    Currently Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {galleryList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryList.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-amber-600 ring-2 ring-amber-300'
                        : 'border-amber-100 hover:border-amber-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Order Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-amber-700 uppercase tracking-widest text-[11px]">
                  {product.category}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-stone-800 text-xs">{product.rating}</span>
                    <span className="text-stone-400 text-[11px]">({product.reviewCount || 0} reviews)</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 leading-snug">
                {product.name}
              </h1>

              {/* Price Tag */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                {product.description}
              </p>

              {/* Weight / Portion Selector */}
              {product.weightOptions && product.weightOptions.length > 0 && (
                <div className="mt-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                    Select Portion / Weight
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.weightOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedWeight(opt)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedWeight === opt
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-amber-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="mt-6 flex items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-amber-200 rounded-xl bg-amber-50/50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !product.isAvailable}
                    className="p-1.5 rounded-lg text-stone-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={!product.isAvailable}
                    className="p-1.5 rounded-lg text-stone-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Actions Button Group */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md ${
                    product.isAvailable
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}</span>
                </Button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label="Toggle Wishlist"
                  className={`px-4 py-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-amber-200 text-stone-700 hover:bg-amber-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Wishlist'}</span>
                </button>
              </div>
            </div>

            {/* Product Specifications Badge Grid */}
            <div className="mt-8 pt-6 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/40 border border-amber-100">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-semibold">Preparation Lead Time</strong>
                  <span className="text-stone-600">
                    {product.minLeadTimeHours ? `${product.minLeadTimeHours} Hours Advance Notice` : 'Standard Delivery'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/40 border border-amber-100">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-semibold">Shelf Life</strong>
                  <span className="text-stone-600">{product.shelfLife || '2–3 days refrigerated'}</span>
                </div>
              </div>

              {product.allergens && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/40 border border-amber-100">
                  <strong className="block text-stone-900 font-semibold mb-1">Allergen Information</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {product.allergens.map((alg) => (
                      <span key={alg} className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] font-semibold text-stone-700">
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
                  You Might Also Love
                </span>
                <h2 className="text-2xl font-bold font-serif text-stone-900">
                  More From {product.category}
                </h2>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>View Category</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ProductDetailsPage
