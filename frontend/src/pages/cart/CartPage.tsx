import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/features/cart/hooks/useCart'
import { Button } from '@/components/ui/Button'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

export const CartPage: React.FC = () => {
  const { items, summary, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    setIsUpdating(itemId)
    try {
      await updateQuantity(itemId, newQty)
    } finally {
      setIsUpdating(null)
    }
  }

  const confirmRemove = async () => {
    if (!itemToRemove) return
    await removeFromCart(itemToRemove.id)
    setItemToRemove(null)
  }

  const handleCheckoutClick = () => {
    navigate('/checkout')
  }


  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50/50 py-16 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-100/80 text-amber-700 mx-auto flex items-center justify-center mb-6 shadow-sm border border-amber-200/60">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Your Cart is Waiting
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-stone-500 leading-relaxed">
            Your cart is currently empty. Explore our daily fresh 100% eggless cakes, artisan breads, and pastries to add something delicious!
          </p>
          <Link to="/products" className="mt-8 inline-block">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md px-8">
              Browse Fresh Bakes <ArrowRight className="ml-2 h-4 w-4" />
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
          <span className="font-semibold text-stone-800">Shopping Cart</span>
        </nav>

        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
              Customer Lounge
            </span>
            <h1 className="text-3xl font-bold font-serif text-stone-900">
              Shopping Cart ({summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'})
            </h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-800 self-start sm:self-auto cursor-pointer"
          >
            Clear Entire Cart
          </button>
        </div>

        {/* Cart Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-amber-100/80 shadow-xs flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4">
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-amber-50 shrink-0 border border-amber-100 block"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/images/Logo.jpeg'
                      }}
                    />
                  </Link>

                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm sm:text-base font-bold font-serif text-stone-900 hover:text-amber-700 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                      <span className="bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-medium text-amber-900">
                        {item.weightOption}
                      </span>
                      <span>• ₹{item.unitPrice.toLocaleString('en-IN')} each</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-amber-200 rounded-xl bg-amber-50/50 p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating === item.id}
                      className="p-1 rounded-lg text-stone-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={isUpdating === item.id}
                      className="p-1 rounded-lg text-stone-600 hover:bg-white cursor-pointer"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-base sm:text-lg font-extrabold text-stone-900 block">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => setItemToRemove({ id: item.id, name: item.name })}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    aria-label={`Remove ${item.name} from cart`}
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Baking Assurance Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-3 text-xs text-stone-700">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <strong>Freshness Guarantee:</strong> All bakes are 100% vegetarian & eggless, freshly prepared in our Barrackpore kitchen on your order day.
              </span>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl bg-white p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="text-lg font-bold font-serif text-stone-900">Order Summary</h2>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  {summary.totalItems} {summary.totalItems === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-stone-900">
                    ₹{summary.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges</span>
                  <span className="text-stone-500 font-medium italic">Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Special Discount</span>
                  <span className="text-emerald-700 font-bold">Apply at checkout</span>
                </div>

                <div className="border-t border-amber-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-bold text-stone-900">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-amber-800 font-serif">
                    ₹{summary.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckoutClick}
                  size="lg"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md py-3.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </Button>

                <Link to="/products" className="block text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-200 text-stone-700 hover:bg-amber-50 rounded-xl"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-stone-400">
                  Secure checkout • Delivery slots selected at next step
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Removal */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setItemToRemove(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl z-10 animate-scaleUp text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Remove from Cart?
            </h3>
            <p className="mt-2 text-xs text-stone-500">
              Are you sure you want to remove <strong>"{itemToRemove.name}"</strong> from your shopping cart?
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItemToRemove(null)}
                className="w-1/2 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmRemove}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default CartPage
