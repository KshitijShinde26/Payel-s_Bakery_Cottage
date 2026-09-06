import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Clock,
  Wand2,
  Heart,
  PackageCheck,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react'
import type { CustomerDashboardSummary } from '../types'

interface CustomerStatsCardsProps {
  summary?: CustomerDashboardSummary | null
  cartItemCount: number
  wishlistCount: number
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({
  summary,
  cartItemCount,
  wishlistCount,
}) => {
  const activeOrders = summary?.activeOrdersCount ?? 0
  const totalOrders = summary?.totalOrdersCount ?? 0
  const customCakes = summary?.customCakesCount ?? 0
  const pendingPayments = summary?.pendingPaymentsCount ?? 0

  const stats = [
    {
      label: 'Active Bakery Orders',
      value: activeOrders,
      suffix: activeOrders === 1 ? 'order' : 'orders',
      icon: Clock,
      status: activeOrders > 0 ? 'Baking / In-transit' : 'No active orders',
      statusColor: activeOrders > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-stone-500 bg-stone-50 border-stone-200',
      link: '/customer/orders',
      accent: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Custom Cake Requests',
      value: customCakes,
      suffix: customCakes === 1 ? 'request' : 'requests',
      icon: Wand2,
      status: summary?.pendingCustomCakesCount ? `${summary.pendingCustomCakesCount} under review` : 'All caught up',
      statusColor: summary?.pendingCustomCakesCount ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-stone-500 bg-stone-50 border-stone-200',
      link: '/customer/custom-cakes',
      accent: 'from-purple-500 to-amber-700',
    },
    {
      label: 'Items in Cart',
      value: cartItemCount,
      suffix: cartItemCount === 1 ? 'item' : 'items',
      icon: ShoppingBag,
      status: cartItemCount > 0 ? 'Ready for checkout' : 'Cart is empty',
      statusColor: cartItemCount > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-stone-500 bg-stone-50 border-stone-200',
      link: '/cart',
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Saved in Wishlist',
      value: wishlistCount,
      suffix: wishlistCount === 1 ? 'cake' : 'cakes',
      icon: Heart,
      status: wishlistCount > 0 ? 'Saved favorites' : 'No saved bakes',
      statusColor: wishlistCount > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-stone-500 bg-stone-50 border-stone-200',
      link: '/wishlist',
      accent: 'from-rose-500 to-rose-600',
    },
    {
      label: 'Total Orders Placed',
      value: totalOrders,
      suffix: totalOrders === 1 ? 'lifetime order' : 'lifetime orders',
      icon: PackageCheck,
      status: totalOrders > 0 ? 'Valued Customer' : 'First order waiting',
      statusColor: 'text-stone-600 bg-stone-100/80 border-stone-200',
      link: '/customer/orders',
      accent: 'from-stone-600 to-stone-800',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      suffix: pendingPayments === 1 ? 'payment' : 'payments',
      icon: CreditCard,
      status: pendingPayments > 0 ? 'Verification pending' : 'All clear',
      statusColor: pendingPayments > 0 ? 'text-amber-800 bg-amber-100 border-amber-300' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      link: '#payments',
      accent: 'from-amber-600 to-stone-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Link
            key={stat.label}
            to={stat.link}
            className="group relative bg-white rounded-3xl p-5 sm:p-6 border border-amber-100/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                    {stat.value}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {stat.suffix}
                  </span>
                </div>
              </div>

              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.accent} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stat.statusColor}`}>
                {stat.status}
              </span>
              <span className="inline-flex items-center gap-0.5 text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform text-[11px]">
                View Details
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
