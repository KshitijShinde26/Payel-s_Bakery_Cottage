import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import { orderService } from '@/features/checkout/services/orderService'
import {
  ShoppingBag,
  Package,
  Heart,
  Sparkles,
  Wand2,
  User,
  Clock,
  ArrowRight,
  Gift,
  Cake,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth()
  const { summary } = useCart()
  const { wishlistCount } = useWishlist()
  const [ordersCount, setOrdersCount] = useState<number>(0)

  useEffect(() => {
    const fetchOrdersCount = async () => {
      if (user?.id) {
        const orders = await orderService.getMyOrders(user.id)
        setOrdersCount(orders.length)
      }
    }
    fetchOrdersCount()
  }, [user?.id])

  const quickActions = [
    {
      title: 'Browse Fresh Bakes',
      description: 'Explore daily fresh cakes, breads & pastries',
      icon: Cake,
      link: '/products',
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Design Custom Cake',
      description: 'Upload reference design & choose flavors',
      icon: Wand2,
      link: '/customer/customize-cake',
      color: 'from-amber-600 to-amber-700',
    },
    {
      title: 'Custom Cake Requests',
      description: 'Track kitchen reviews & design quotes',
      icon: Sparkles,
      link: '/customer/custom-cakes',
      color: 'from-amber-700 to-amber-800',
    },
    {
      title: 'My Shopping Cart',
      description: `${summary.totalItems} items ready for celebration`,
      icon: ShoppingBag,
      link: '/cart',
      color: 'from-amber-800 to-stone-900',
    },
    {
      title: 'My Saved Wishlist',
      description: `${wishlistCount} bakes saved for later`,
      icon: Heart,
      link: '/wishlist',
      color: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Order History',
      description: 'Track orders, reorder past favorites',
      icon: Package,
      link: '/customer/orders',
      color: 'from-amber-800 to-stone-900',
    },
    {
      title: 'My Profile & Addresses',
      description: 'Manage personal details and delivery addresses',
      icon: User,
      link: '/profile',
      color: 'from-stone-700 to-stone-800',
    },
  ]

  const stats = [
    { label: 'Cart Items', value: `${summary.totalItems}`, icon: ShoppingBag, change: 'Ready in Cart' },
    { label: 'Active Bakery Orders', value: `${ordersCount}`, icon: Clock, change: 'In Kitchen Queue' },
    { label: 'Saved in Wishlist', value: `${wishlistCount}`, icon: Heart, change: 'Saved bakes' },
    { label: 'Cottage Bakery Points', value: '100 pts', icon: Sparkles, change: 'Welcome Gift' },
  ]



  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-6 sm:p-8 md:p-10 shadow-xl shadow-amber-950/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-semibold mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisanal Handcrafted Delights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            Welcome back, {user?.fullName || 'Valued Guest'}! 🥐
          </h1>
          <p className="mt-2.5 text-amber-100/90 text-sm sm:text-base leading-relaxed">
            Freshly baked cakes, warm sourdough breads, and artisanal cookies are baking right now at Payal's Bakery Cottage.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-900 font-semibold text-sm hover:bg-amber-50 shadow-md transition-all hover:translate-y-[-1px]"
            >
              <Cake className="w-4 h-4 text-amber-700" />
              Explore Menu
            </Link>
            <Link
              to="/products?category=Customized%20Cakes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              Custom Cake Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-amber-100/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-stone-900 mt-1 font-serif">{stat.value}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Order Tracker & Status Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Current Order Status</h2>
            <p className="text-xs text-stone-500">Live tracker for items currently baking or on delivery route</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Kitchen Operating Normally
          </span>
        </div>

        {/* Empty State / Status Flow */}
        <div className="bg-amber-50/40 rounded-2xl p-6 text-center border border-dashed border-amber-200">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No Active Orders in Kitchen</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
            You don't have any active orders right now. Craving something fresh? Place your first artisanal order today!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-sm transition-all"
          >
            Browse Today's Specials
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-stone-900">Quick Actions</h2>
          <span className="text-xs text-amber-800 font-semibold">Cottage Services</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                to={action.link}
                className="group relative bg-white rounded-2xl p-5 border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{action.description}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                  <span>Open Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Featured Cottage Specials & Offers Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Fresh Specials */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">Featured Fresh Bakes</h2>
              <p className="text-xs text-stone-500">Signature bakes crafted fresh this morning</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-amber-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                name: 'Belgian Chocolate Truffle Cake',
                category: 'Signature Cakes',
                tag: 'Bestseller',
                price: '₹750',
              },
              {
                name: 'Fresh Strawberry Cream Gateau',
                category: 'Seasonal Cakes',
                tag: 'Fresh Batch',
                price: '₹850',
              },
              {
                name: 'Artisanal Butter Croissants (4-Pack)',
                category: 'Breads & Viennoiserie',
                tag: 'Morning Bake',
                price: '₹320',
              },
              {
                name: 'Wild Blueberry Cupcakes (Box of 6)',
                category: 'Cupcakes',
                tag: 'Popular',
                price: '₹420',
              },
            ].map((product) => (
              <div
                key={product.name}
                className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/80 hover:bg-amber-50/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      {product.tag}
                    </span>
                    <span className="text-xs font-bold text-stone-900">{product.price}</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">{product.name}</h4>
                  <p className="text-[11px] text-stone-500">{product.category}</p>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600 hover:text-white text-amber-800 text-[11px] font-semibold transition-colors"
                >
                  Quick Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cottage Offers & Membership Perks */}
        <div className="bg-gradient-to-br from-amber-50 via-amber-100/40 to-amber-200/30 rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900">Welcome Coupon</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Use code <strong className="text-amber-800 font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">COTTAGE10</strong> at checkout to get 10% off your first cake order!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/60 backdrop-blur-xs">
            <p className="text-xs font-bold text-stone-800">Cottage Club Points</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold font-serif text-amber-700">100 Pts</span>
              <span className="text-[10px] text-stone-500">Tier: Bronze Baker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CustomerDashboard
