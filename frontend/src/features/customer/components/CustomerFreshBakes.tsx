import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check, Star, Sparkles, Cake } from 'lucide-react'
import { useCart } from '@/features/cart/hooks/useCart'
import type { Product } from '@/features/catalog/types'

interface CustomerFreshBakesProps {
  products: Product[]
}

export const CustomerFreshBakes: React.FC<CustomerFreshBakesProps> = ({ products }) => {
  const { addToCart, items } = useCart()

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const weight = product.weightOptions && product.weightOptions.length > 0
      ? product.weightOptions[0]
      : 'Standard'

    await addToCart({
      product,
      quantity: 1,
      weightOption: weight,
    })
  }

  const isProductInCart = (productId: string) => {
    return items.some((item) => item.productId === productId)
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Fresh Daily Menu
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              <Sparkles className="w-3 h-3 text-amber-600" />
              100% Eggless
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            Featured Bakes & Customer Favorites
          </h2>
        </div>

        <Link
          to="/products"
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline transition-colors self-start sm:self-auto"
        >
          View Full Menu →
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => {
            const inCart = isProductInCart(product.id)
            const imgUrl = product.image || ''

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl p-3.5 border border-amber-100/80 hover:border-amber-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <Link to={`/products/${product.id}`} className="block relative aspect-4/3 rounded-2xl overflow-hidden bg-amber-50 mb-3">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {product.isBestseller && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                        Bestseller
                      </span>
                    )}
                    {product.rating && (
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {product.rating}
                      </span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      {product.category}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <h4 className="font-serif font-bold text-stone-900 text-sm hover:text-amber-800 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {product.shortDescription || product.description}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="mt-4 pt-3 border-t border-stone-100 px-1 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif font-extrabold text-stone-900 text-base">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-stone-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                      inCart
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs hover:scale-105'
                    }`}
                    title={inCart ? 'Item already in cart' : 'Add to cart'}
                  >
                    {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Purposeful Empty State */
        <div className="p-8 text-center bg-stone-50/50 rounded-3xl border border-dashed border-stone-200 space-y-2">
          <Cake className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="text-sm font-semibold text-stone-800">No products available currently</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Our daily batch menu will update shortly with fresh oven bakes.
          </p>
        </div>
      )}
    </div>
  )
}
