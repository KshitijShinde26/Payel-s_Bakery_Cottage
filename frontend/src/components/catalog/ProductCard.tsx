import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/features/catalog/types'
import { useCart } from '@/features/cart/hooks/useCart'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react'

export interface ProductCardProps {
  product: Product
  onQuickAdd?: (product: Product) => void
  onToggleWishlist?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const wishlisted = isInWishlist(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart({ product })
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlisted) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }


  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-amber-100/80 shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-amber-50/50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/images/Logo.jpeg'
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isEggless && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700/95 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
              100% Eggless
            </span>
          )}
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/95 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow-xs backdrop-blur-xs transition-colors z-10 cursor-pointer ${
            wishlisted
              ? 'bg-rose-50 text-red-500 hover:bg-rose-100'
              : 'bg-white/90 text-stone-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>


        {/* Availability Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-amber-700 uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-stone-700 text-xs">{product.rating}</span>
                <span className="text-stone-400 text-[10px]">({product.reviewCount || 0})</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.id}`} className="group/title block">
            <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 line-clamp-1 group-hover/title:text-amber-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-amber-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-stone-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-500 font-medium block">
              {product.weightOptions?.[0] || 'Standard Portion'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product.id}`}
              className="text-xs font-semibold px-2.5 py-1.5 text-stone-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
            >
              Details
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              aria-label={`Add ${product.name} to cart`}
              className={`flex items-center justify-center h-9 w-9 rounded-xl transition-all cursor-pointer ${
                product.isAvailable
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs hover:shadow-md'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title={product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ProductCard
