import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import { customerService } from '@/features/customer/services/customerService'
import type { CustomerDashboardSummary, CustomerPayment } from '@/features/customer/types'
import type { Order } from '@/features/checkout/types'
import type { CustomCakeRequest } from '@/features/customCake/types'

import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { CustomerStatsCards } from '@/features/customer/components/CustomerStatsCards'
import { CustomerActiveOrders } from '@/features/customer/components/CustomerActiveOrders'
import { CustomerRecentOrders } from '@/features/customer/components/CustomerRecentOrders'
import { CustomerCustomCakesPreview } from '@/features/customer/components/CustomerCustomCakesPreview'
import { CustomerPaymentSection } from '@/features/customer/components/CustomerPaymentSection'
import { CustomerQuickActions } from '@/features/customer/components/CustomerQuickActions'
import { CustomerFreshBakes } from '@/features/customer/components/CustomerFreshBakes'
import { RefreshCw, AlertCircle } from 'lucide-react'

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth()
  const { summary: cartSummary } = useCart()
  const { wishlistCount } = useWishlist()

  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [customCakes, setCustomCakes] = useState<CustomCakeRequest[]>([])
  const [payments, setPayments] = useState<CustomerPayment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryData, ordersData, cakesData, paymentsData] = await Promise.all([
        customerService.getDashboardSummary().catch(() => null),
        customerService.getOrders().catch(() => []),
        customerService.getCustomCakes().catch(() => []),
        customerService.getPayments().catch(() => []),
      ])

      setSummary(summaryData)
      setOrders(ordersData || [])
      setCustomCakes(cakesData || [])
      setPayments(paymentsData || [])
    } catch (err: unknown) {
      console.error('Failed to load customer dashboard:', err)
      setError('Unable to load bakery dashboard. Please check your internet connection or reload.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = "Customer Lounge | Payal's Bakery Cottage"
    loadDashboardData()
  }, [loadDashboardData, user?.id])

  if (loading && !summary) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-56 bg-stone-200/80 rounded-3xl" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white rounded-3xl border border-stone-200 p-6" />
          ))}
        </div>

        {/* Tracker Skeleton */}
        <div className="h-64 bg-white rounded-3xl border border-stone-200 p-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white border border-red-200 p-8 text-center space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-serif font-bold text-stone-900">Dashboard Unavailable</h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">{error}</p>
        <button
          type="button"
          onClick={loadDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    )
  }

  const featuredBakes = summary?.featuredProducts?.length
    ? summary.featuredProducts
    : summary?.bestSellers || []

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Personalized Header */}
      <CustomerHeader
        summary={summary}
        cartItemCount={cartSummary.totalItems}
      />

      {/* 2. Key Dynamic Stats */}
      <CustomerStatsCards
        summary={summary}
        cartItemCount={cartSummary.totalItems}
        wishlistCount={wishlistCount}
      />

      {/* 3. Live Active Kitchen Order Tracker */}
      <CustomerActiveOrders orders={orders} />

      {/* 4. Quick Actions Hub */}
      <CustomerQuickActions
        cartItemCount={cartSummary.totalItems}
        wishlistCount={wishlistCount}
      />

      {/* 5. Payment Verification & UTR Submission */}
      <CustomerPaymentSection
        orders={orders}
        payments={payments}
        onPaymentSubmitted={loadDashboardData}
      />

      {/* 6. Two-Column Split: Recent Orders & Custom Cake Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <CustomerRecentOrders orders={orders} />
        </div>
        <div className="lg:col-span-5">
          <CustomerCustomCakesPreview requests={customCakes} />
        </div>
      </div>

      {/* 7. Real Catalog Showcase */}
      <CustomerFreshBakes products={featuredBakes} />
    </div>
  )
}
export default CustomerDashboard
