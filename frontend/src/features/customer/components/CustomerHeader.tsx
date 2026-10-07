import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Cake, Wand2, ShoppingCart } from 'lucide-react'
import type { CustomerDashboardSummary } from '../types'

interface CustomerHeaderProps {
  summary?: CustomerDashboardSummary | null
  cartItemCount: number
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({ summary, cartItemCount }) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const name = summary?.fullName || 'Valued Guest'

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-6 sm:p-8 md:p-10 shadow-xl shadow-amber-950/10">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-12 w-56 h-56 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-semibold mb-4 border border-white/10 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Payal's Bakery Cottage • Handcrafted with Love</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
          {getGreeting()}, {name}! 🥐
        </h1>

        <p className="mt-3 text-amber-100/90 text-xs sm:text-sm sm:leading-relaxed">
          Welcome to your personal bakery lounge. Explore freshly baked artisan cakes, monitor oven baking queues in real-time, or design your next bespoke celebration cake.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-900 font-semibold text-xs sm:text-sm hover:bg-amber-50 shadow-md transition-all hover:-translate-y-0.5"
          >
            <Cake className="w-4 h-4 text-amber-700" />
            Browse Fresh Bakes
          </Link>
          <Link
            to="/customer/customize-cake"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all hover:-translate-y-0.5"
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            Custom Cake Studio
          </Link>
          {cartItemCount > 0 && (
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 font-semibold text-xs sm:text-sm backdrop-blur-md border border-amber-300/30 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              <span>Cart ({cartItemCount})</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
