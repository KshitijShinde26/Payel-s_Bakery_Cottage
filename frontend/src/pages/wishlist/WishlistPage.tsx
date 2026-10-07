import React from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import { Button } from '@/components/ui/Button'
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Star,
} from 'lucide-react'

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, moveToCart, wishlistCount } = useWishlist()

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50/50 py-16 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-6 shadow-sm border border-rose-200/60">
            <Heart className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Your Wishlist is Empty
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-stone-500 leading-relaxed">
            Your wishlist is waiting for something sweet. Save your favorite cakes, pastries, and artisanal bakes to order for upcoming special moments!
          </p>
          <Link to="/products" className="mt-8 inline-block">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md px-8">
              Explore Bakery <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

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
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800">My Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
              Saved Delicacies
            </span>
            <h1 className="text-3xl font-bold font-serif text-stone-900">
              My Wishlist ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})
            </h1>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm" className="border-amber-200 text-stone-700 rounded-xl">
              Browse More Bakes
            </Button>
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(({ id, product }) => (
            <div
              key={id}
              className="group relative flex flex-col rounded-2xl bg-white border border-amber-100/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-amber-50">
                <Link to={`/products/${product.id}`} className="block h-full w-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/images/Logo.jpeg'
                    }}
                  />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  {product.isEggless && (
                    <span className="rounded-full bg-emerald-700/95 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
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

                {/* Remove from Wishlist button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-xs hover:bg-red-50 transition-colors z-10 cursor-pointer"
                  aria-label={`Remove ${product.name} from wishlist`}
                  title="Remove from Wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <span className="rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-md">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info & Action */}
              <div className="p-4 sm:p-5 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-700 uppercase tracking-wider text-[10px]">
                      {product.category}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-stone-700 text-xs">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  <Link to={`/products/${product.id}`} className="group/title block">
                    <h3 className="text-sm font-bold font-serif text-stone-900 line-clamp-1 group-hover/title:text-amber-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-extrabold text-stone-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {product.weightOptions?.[0] || 'Standard'}
                    </span>
                  </div>

                  {/* Move to Cart Action Button */}
                  <Button
                    onClick={() => moveToCart(product)}
                    disabled={!product.isAvailable}
                    size="sm"
                    className={`w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs ${
                      product.isAvailable
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.isAvailable ? 'Move to Cart' : 'Currently Unavailable'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default WishlistPage
