import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { shopkeeperService } from '@/features/shopkeeper/services/shopkeeperService'
import type {
  Order,
  OrderStatus,
  CustomCakeRequest,
  CustomCakeStatus,
  FeasibilityDecision,
  ShopkeeperSummary,
  Product,
} from '@/features/shopkeeper/types'
import { CATEGORIES } from '@/features/catalog/services/productService'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import {
  Flame,
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  CakeSlice,
  Search,
  Sparkles,
  RefreshCw,
  Eye,
  Edit3,
  Calendar,
  MapPin,
  Phone,
  X,
  LayoutDashboard,
  CreditCard,
  ChefHat,
  Info,
} from 'lucide-react'

const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PREPARING':
      return { label: 'Baking / In Prep', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: Flame }
    case 'READY':
      return { label: 'Ready for Dispatch', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 }
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out with Courier', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck }
    case 'DELIVERED':
    case 'COMPLETED':
      return { label: 'Delivered & Complete', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 }
    case 'CONFIRMED':
    case 'PAYMENT_VERIFIED':
      return { label: 'Order Confirmed', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock }
    case 'DELIVERY_FAILED':
      return { label: 'Delivery Exception', className: 'bg-rose-100 text-rose-800 border-rose-200', icon: X }
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200', icon: X }
    case 'AWAITING_PAYMENT':
    default:
      return { label: 'Awaiting Payment', className: 'bg-stone-100 text-stone-700 border-stone-200', icon: Clock }
  }
}

const getCustomCakeBadge = (status: CustomCakeStatus) => {
  switch (status) {
    case 'APPROVED':
      return { label: 'Approved & Quoted', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case 'UNDER_REVIEW':
      return { label: 'Under Kitchen Review', className: 'bg-amber-100 text-amber-800 border-amber-200' }
    case 'CHANGES_REQUESTED':
      return { label: 'Changes Requested', className: 'bg-orange-100 text-orange-800 border-orange-200' }
    case 'REJECTED':
      return { label: 'Declined', className: 'bg-red-100 text-red-800 border-red-200' }
    case 'CONVERTED_TO_ORDER':
      return { label: 'Converted to Order', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'PENDING_REVIEW':
    default:
      return { label: 'Pending Feasibility Review', className: 'bg-rose-100 text-rose-800 border-rose-200' }
  }
}

export const ShopkeeperDashboard: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  // Tab State
  type TabType = 'overview' | 'queue' | 'orders' | 'products' | 'custom_cakes'
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Live Data States
  const [summary, setSummary] = useState<ShopkeeperSummary | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [customCakes, setCustomCakes] = useState<CustomCakeRequest[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [cakeStatusFilter, setCakeStatusFilter] = useState<string>('ALL')
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL')

  // Modals & Inspection Drawers
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [reviewCake, setReviewCake] = useState<CustomCakeRequest | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)

  // Review Form State
  const [reviewForm, setReviewForm] = useState<{
    status: CustomCakeStatus
    confirmedPrice: number
    feasibilityDecision: FeasibilityDecision
    bakeryNotes: string
  }>({
    status: 'APPROVED',
    confirmedPrice: 0,
    feasibilityDecision: 'FEASIBLE',
    bakeryNotes: '',
  })

  // Sync hash with active tab state
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase()
    if (hash === 'orders' || hash === 'all_orders') {
      setActiveTab('orders')
    } else if (hash === 'custom_cakes' || hash === 'cakes' || hash === 'custom') {
      setActiveTab('custom_cakes')
    } else if (hash === 'queue') {
      setActiveTab('queue')
    } else if (hash === 'products') {
      setActiveTab('products')
    } else {
      setActiveTab('overview')
    }
  }, [location.hash])

  // Fetch all bakery data
  const fetchData = async () => {
    try {
      const [summaryData, ordersList, cakesList, productsList] = await Promise.all([
        shopkeeperService.getSummary(),
        shopkeeperService.getOrders(),
        shopkeeperService.getCustomCakes(),
        shopkeeperService.getProducts(),
      ])
      setSummary(summaryData)
      setOrders(ordersList)
      setCustomCakes(cakesList)
      setProducts(productsList)
    } catch (err) {
      console.error('Failed to load shopkeeper data', err)
      toast.error('Failed to refresh live bakery data.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    document.title = "Shopkeeper Workspace | Payal's Bakery Cottage"
    fetchData()
  }, [])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchData()
    toast.success('Kitchen queue, catalog & requests updated!')
  }

  // Quick Order Status Transition
  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus, notes?: string) => {
    try {
      const updated = await shopkeeperService.updateOrderStatus(orderId, {
        status: nextStatus,
        kitchenNotes: notes,
      })
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder(updated)
      }
      toast.success(`Order #${updated.orderNumber || updated.id} updated to ${nextStatus.replace(/_/g, ' ')}`)
      shopkeeperService.getSummary().then(setSummary)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order status.')
    }
  }

  // Custom Cake Review Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewCake) return

    try {
      const updated = await shopkeeperService.reviewCustomCake(reviewCake.id, {
        status: reviewForm.status,
        confirmedPrice: Number(reviewForm.confirmedPrice),
        feasibilityDecision: reviewForm.feasibilityDecision,
        bakeryNotes: reviewForm.bakeryNotes,
      })
      setCustomCakes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setReviewCake(null)
      toast.success(`Custom cake request #${updated.id} successfully reviewed!`)
      shopkeeperService.getSummary().then(setSummary)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit cake review.')
    }
  }

  // Open review modal
  const openReviewModal = (cake: CustomCakeRequest) => {
    setReviewCake(cake)
    setReviewForm({
      status: cake.status === 'PENDING_REVIEW' ? 'APPROVED' : cake.status,
      confirmedPrice: cake.confirmedPrice || cake.estimatedPrice || 1500,
      feasibilityDecision: (cake.feasibilityDecision as FeasibilityDecision) || 'FEASIBLE',
      bakeryNotes: cake.bakeryNotes || '',
    })
  }

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = orderStatusFilter === 'ALL' || order.orderStatus === orderStatusFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        order.orderNumber?.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.deliveryAddress?.fullName?.toLowerCase().includes(q) ||
        order.deliveryAddress?.phoneNumber?.includes(q) ||
        order.items?.some((it) => it.productName.toLowerCase().includes(q))
      return matchStatus && matchQuery
    })
  }, [orders, orderStatusFilter, searchQuery])

  // Active Kitchen Queue Orders
  const activeQueueOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderStatus === 'CONFIRMED' ||
        o.orderStatus === 'PAYMENT_VERIFIED' ||
        o.orderStatus === 'PREPARING' ||
        o.orderStatus === 'READY' ||
        o.orderStatus === 'OUT_FOR_DELIVERY'
    )
  }, [orders])

  // Filtered Custom Cakes
  const filteredCakes = useMemo(() => {
    return customCakes.filter((cake) => {
      const matchStatus = cakeStatusFilter === 'ALL' || cake.status === cakeStatusFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        cake.id.toLowerCase().includes(q) ||
        cake.cakeType.toLowerCase().includes(q) ||
        cake.flavor.toLowerCase().includes(q) ||
        cake.customMessage?.toLowerCase().includes(q) ||
        cake.customerName?.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [customCakes, cakeStatusFilter, searchQuery])

  // Filtered Products (Read-Only)
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCategory =
        productCategoryFilter === 'ALL' || prod.category.toLowerCase() === productCategoryFilter.toLowerCase()
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q)
      return matchCategory && matchQuery
    })
  }, [products, productCategoryFilter, searchQuery])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-sm text-stone-600 font-medium">Loading Shopkeeper Workspace...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
              Kitchen Operations & Fulfillment
            </span>
            <span className="text-xs text-stone-400">• Authenticated as {user?.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
            Payal's Bakery Cottage — Shopkeeper Hub
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Real-time kitchen order preparation queue, delivery dispatch, and custom cake review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-stone-800/80 hover:bg-stone-700 text-white border-stone-700 text-xs font-semibold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview')
            window.location.hash = '#overview'
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Kitchen Overview
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('queue')
            window.location.hash = '#queue'
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Flame className="w-4 h-4" />
          Active Queue ({activeQueueOrders.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('orders')
            window.location.hash = '#orders'
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Manage Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('products')
            window.location.hash = '#products'
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <CakeSlice className="w-4 h-4" />
          Product Reference ({products.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('custom_cakes')
            window.location.hash = '#custom_cakes'
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'custom_cakes'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Custom Cakes ({customCakes.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CakeSlice className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Catalog Products</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-stone-900">{summary?.totalProducts ?? products.length}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    ({summary?.availableProducts ?? products.filter((p) => p.isAvailable).length} in stock)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">In Kitchen Prep</p>
                <span className="text-xl font-bold text-orange-600 block mt-0.5">
                  {summary?.preparingOrders ?? orders.filter((o) => o.orderStatus === 'PREPARING').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Ready for Dispatch</p>
                <span className="text-xl font-bold text-emerald-600 block mt-0.5">
                  {summary?.readyOrders ?? orders.filter((o) => o.orderStatus === 'READY').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Custom Cakes</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-stone-900">
                    {summary?.totalCustomCakes ?? customCakes.length}
                  </span>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    ({summary?.pendingCustomCakes ?? customCakes.filter((c) => c.status === 'PENDING_REVIEW').length}{' '}
                    pending)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Out with Courier</p>
                <span className="text-xl font-bold text-blue-600 block mt-0.5">
                  {summary?.outForDeliveryOrders ?? orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pending Orders</p>
                <span className="text-xl font-bold text-purple-600 block mt-0.5">
                  {summary?.pendingOrders ??
                    orders.filter((o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'AWAITING_PAYMENT').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Completed Orders</p>
                <span className="text-xl font-bold text-stone-900 block mt-0.5">
                  {summary?.completedOrders ??
                    orders.filter((o) => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Payment Status</p>
                <span className="text-xl font-bold text-yellow-700 block mt-0.5">
                  {summary?.pendingPayments ?? orders.filter((o) => o.paymentStatus === 'PENDING').length} Pending
                </span>
              </div>
            </div>
          </div>

          {/* Quick Operations Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setActiveTab('queue')
                window.location.hash = '#queue'
              }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded-full">
                  {activeQueueOrders.length} In Queue
                </span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mt-3">Active Kitchen Queue</h3>
              <p className="text-xs text-stone-600 mt-1">
                Advance orders from confirmed to baking, packaging, and courier dispatch.
              </p>
            </div>

            <div
              onClick={() => {
                setActiveTab('products')
                window.location.hash = '#products'
              }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <CakeSlice className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-full">
                  {products.length} Products
                </span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mt-3">Product Catalog Reference</h3>
              <p className="text-xs text-stone-600 mt-1">
                View catalog items, flavors, ingredients, allergens, and current stock status.
              </p>
            </div>

            <div
              onClick={() => {
                setActiveTab('custom_cakes')
                window.location.hash = '#custom_cakes'
              }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-purple-800 bg-purple-200/60 px-2.5 py-1 rounded-full">
                  {customCakes.filter((c) => c.status === 'PENDING_REVIEW').length} Pending Review
                </span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mt-3">Custom Cake Inquiries</h3>
              <p className="text-xs text-stone-600 mt-1">
                Inspect customer reference photos, assess feasibility, and submit pricing quotes.
              </p>
            </div>
          </div>

          {/* Active Kitchen Priority Orders Preview */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-600" />
                  Live Kitchen Preparation Queue
                </h3>
                <p className="text-xs text-stone-500">Orders currently in baking, cooling, and dispatch stage.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('queue')
                  window.location.hash = '#queue'
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
              >
                View Full Queue →
              </button>
            </div>

            {activeQueueOrders.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                🎉 Kitchen queue is clear! No orders currently awaiting preparation.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeQueueOrders.slice(0, 6).map((order) => {
                  const badge = getOrderStatusBadge(order.orderStatus)
                  const BadgeIcon = badge.icon
                  return (
                    <div
                      key={order.id}
                      className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-xs text-stone-900">
                            #{order.orderNumber || order.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-stone-800">
                          {order.deliveryAddress?.fullName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-stone-500 mb-2 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {order.deliveryAddress?.phoneNumber || 'No phone'}
                        </p>

                        <div className="border-t border-stone-200/80 pt-2 space-y-1">
                          {order.items?.map((item, idx) => (
                            <p key={idx} className="text-xs text-stone-700 truncate">
                              <span className="font-bold text-amber-700">{item.quantity}x</span> {item.productName} (
                              {item.weightOption})
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">₹{order.grandTotal}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {order.orderStatus === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.id, 'PREPARING')}
                              className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Start Baking
                            </button>
                          )}
                          {order.orderStatus === 'PREPARING' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.id, 'READY')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.orderStatus === 'READY' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. KITCHEN QUEUE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                Live Kitchen Fulfillment Queue
              </h2>
              <p className="text-xs text-stone-500">
                Progress bakery items through kitchen baking, packaging, and courier dispatch.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 self-start sm:self-center">
              {activeQueueOrders.length} Active Orders
            </span>
          </div>

          {activeQueueOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm">
              <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-stone-800 text-base">Kitchen Queue is Empty</h3>
              <p className="text-xs text-stone-500 mt-1">All active customer orders have been completed and delivered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeQueueOrders.map((order) => {
                const badge = getOrderStatusBadge(order.orderStatus)
                const BadgeIcon = badge.icon
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between hover:border-amber-400 transition-colors"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Order Number
                          </span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            #{order.orderNumber || order.id}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.className}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      </div>

                      {/* Customer info */}
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-bold text-stone-900">{order.deliveryAddress?.fullName || 'Customer'}</p>
                        <p className="text-xs text-stone-600 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <a href={`tel:${order.deliveryAddress?.phoneNumber}`} className="hover:underline">
                            {order.deliveryAddress?.phoneNumber}
                          </a>
                        </p>
                        {order.deliveryAddress?.addressLine && (
                          <p className="text-[11px] text-stone-500 flex items-start gap-1.5 line-clamp-2">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                            {order.deliveryAddress.addressLine}, {order.deliveryAddress.areaLocality},{' '}
                            {order.deliveryAddress.city}
                          </p>
                        )}
                      </div>

                      {/* Delivery Slot */}
                      {(order.preferredDeliveryDate || order.preferredDeliveryTime) && (
                        <div className="mt-3 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="truncate">
                            {order.preferredDeliveryDate} • {order.preferredDeliveryTime}
                          </span>
                        </div>
                      )}

                      {/* Line Items */}
                      <div className="mt-3.5 pt-3 border-t border-stone-100">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                          Order Items ({order.items?.length || 0})
                        </span>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-stone-800 font-medium truncate max-w-[200px]">
                                <span className="font-bold text-amber-700">{item.quantity}x</span> {item.productName}
                              </span>
                              <span className="text-stone-500 font-semibold shrink-0">
                                {item.weightOption || '1 pc'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Kitchen Notes */}
                      {order.kitchenNotes && (
                        <div className="mt-3 p-2 bg-stone-100 rounded-lg text-xs text-stone-700">
                          <span className="font-bold text-stone-900">Notes:</span> {order.kitchenNotes}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                      >
                        Inspect
                      </button>

                      <div className="flex items-center gap-1.5">
                        {order.orderStatus === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'PREPARING')}
                            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Start Baking
                          </button>
                        )}
                        {order.orderStatus === 'PREPARING' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'READY')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.orderStatus === 'READY' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Dispatch Courier
                          </button>
                        )}
                        {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MANAGE ORDERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by customer, phone, ID, items..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-500">
                        <ClipboardList className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="font-semibold text-stone-700">No orders available</p>
                        <p className="text-xs text-stone-400 mt-0.5">No customer orders have been placed in the database yet.</p>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-500">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const badge = getOrderStatusBadge(order.orderStatus)
                      const BadgeIcon = badge.icon
                      return (
                        <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            #{order.orderNumber || order.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-900">
                              {order.deliveryAddress?.fullName || 'Customer'}
                            </div>
                            <div className="text-[11px] text-stone-500">{order.deliveryAddress?.phoneNumber}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">
                            {order.items?.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-900">₹{order.grandTotal}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.paymentMethod} • {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                            >
                              <BadgeIcon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="text-xs h-8 px-2.5"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRODUCT CATALOG REFERENCE TAB (READ-ONLY) */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Read-Only Notice */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Read-Only Product Inventory Catalog</p>
              <p className="text-amber-800 mt-0.5">
                This catalog is displayed for kitchen preparation and fulfillment reference. Master product data,
                pricing, and inventory modifications are authoritatively managed exclusively through the Central Admin
                Console.
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, category, description..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setProductCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  productCategoryFilter === 'ALL'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setProductCategoryFilter(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    productCategoryFilter.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (Read-Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm col-span-full">
                <CakeSlice className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-stone-800 text-base">No Products Available</h3>
                <p className="text-xs text-stone-500 mt-1">
                  No products have been added yet in the Master Admin Catalog.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-500 text-xs">
                No products found matching your filter criteria.
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                      <img
                        src={prod.image || '/images/Product_1.jpeg'}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/images/Product_1.jpeg'
                        }}
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
                          {prod.category}
                        </span>
                        {prod.isEggless && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                            Eggless
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md ${
                            prod.isAvailable ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {prod.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {prod.shortDescription || prod.description}
                      </p>

                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-base font-bold text-stone-900">₹{prod.price}</span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-xs text-stone-400 line-through">₹{prod.originalPrice}</span>
                        )}
                      </div>

                      {prod.weightOptions && (
                        <p className="text-[11px] text-stone-500 mt-1">
                          Options:{' '}
                          {Array.isArray(prod.weightOptions) ? prod.weightOptions.join(', ') : prod.weightOptions}
                        </p>
                      )}

                      {prod.minLeadTimeHours && (
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Min Prep Time: {prod.minLeadTimeHours} hours
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CUSTOM CAKE REQUESTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'custom_cakes' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search custom cakes by flavor, type, message, customer..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCakeStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    cakeStatusFilter === st
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Cake Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCakes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm col-span-full">
                <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-stone-800 text-base">No Custom Cake Requests Available</h3>
                <p className="text-xs text-stone-500 mt-1">
                  No custom cake inquiries have been submitted by customers yet.
                </p>
              </div>
            ) : filteredCakes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-500 text-xs">
                No custom cake inquiries match your filter criteria.
              </div>
            ) : (
              filteredCakes.map((cake) => {
                const badge = getCustomCakeBadge(cake.status)
                return (
                  <div
                    key={cake.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <span className="font-mono text-xs font-bold text-stone-900">#{cake.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Photo preview */}
                      {cake.referenceImageUrl ? (
                        <div
                          onClick={() => setPreviewImage({ url: cake.referenceImageUrl!, title: `${cake.cakeType} Ref` })}
                          className="mt-3 relative aspect-16/9 bg-stone-100 rounded-xl overflow-hidden cursor-pointer group"
                        >
                          <img
                            src={cake.referenceImageUrl}
                            alt="Design Ref"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            <Eye className="w-4 h-4 mr-1.5" /> View Photo
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 py-4 bg-stone-50 rounded-xl text-center text-stone-400 text-xs">
                          No reference image attached
                        </div>
                      )}

                      {/* Specs */}
                      <div className="mt-3 space-y-1 text-xs">
                        <h4 className="font-serif font-bold text-stone-900 text-sm">
                          {cake.cakeType} — {cake.flavor}
                        </h4>
                        <p className="text-stone-600">
                          <span className="font-semibold">Weight:</span> {cake.weight} •{' '}
                          <span className="font-semibold">Diet:</span> {cake.dietaryPreference}
                        </p>
                        {cake.customMessage && (
                          <p className="text-amber-800 bg-amber-50 p-2 rounded-lg font-serif italic text-xs">
                            "{cake.customMessage}"
                          </p>
                        )}
                        {cake.specialInstructions && (
                          <p className="text-stone-600 text-[11px] line-clamp-2">
                            <span className="font-semibold text-stone-800">Instructions:</span>{' '}
                            {cake.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Quoted Price
                        </span>
                        <span className="font-bold text-stone-900 text-sm">
                          ₹{cake.confirmedPrice || cake.estimatedPrice || 'Pending'}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openReviewModal(cake)}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Review & Quote
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER DETAILS */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Order Details #{selectedOrder.orderNumber || selectedOrder.id}
                </h3>
                <p className="text-xs text-stone-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Customer & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block mb-1">
                    Customer Information
                  </span>
                  <p className="font-bold text-stone-900 text-sm">{selectedOrder.deliveryAddress?.fullName}</p>
                  <p className="text-stone-600">{selectedOrder.deliveryAddress?.phoneNumber}</p>
                  <p className="text-stone-500">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block mb-1">
                    Delivery Address & Slot
                  </span>
                  <p className="text-stone-800">
                    {selectedOrder.deliveryAddress?.addressLine}, {selectedOrder.deliveryAddress?.areaLocality}
                  </p>
                  <p className="text-stone-600">
                    {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.pincode}
                  </p>
                  {selectedOrder.preferredDeliveryDate && (
                    <p className="font-bold text-amber-800 mt-1">
                      Slot: {selectedOrder.preferredDeliveryDate} • {selectedOrder.preferredDeliveryTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Logistics Status */}
              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 text-xs">
                <span className="font-bold text-purple-900 uppercase tracking-wider text-[10px] block mb-1">
                  Delivery Logistics & Courier
                </span>
                {selectedOrder.deliveryPartnerName ? (
                  <div className="space-y-1">
                    <p className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-purple-700" />
                      Assigned Driver: {selectedOrder.deliveryPartnerName} ({selectedOrder.deliveryPartnerPhone || 'No phone'})
                    </p>
                    {selectedOrder.deliveryOtp && (
                      <p className="text-[11px] text-purple-950 font-mono font-bold">
                        Customer Delivery OTP: <span className="bg-white px-1.5 py-0.5 rounded border border-purple-300">{selectedOrder.deliveryOtp}</span>
                      </p>
                    )}
                    {selectedOrder.deliveryNotes && (
                      <p className="text-[11px] text-stone-600 italic">Handling Notes: "{selectedOrder.deliveryNotes}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-800 font-medium">No delivery partner assigned yet (Handled via Admin Console)</p>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block mb-2">
                  Line Items
                </span>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <p className="font-bold text-stone-900">{item.productName}</p>
                        <p className="text-stone-500 text-[11px]">
                          Weight: {item.weightOption} • Unit Price: ₹{item.unitPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-900">
                          {item.quantity} × ₹{item.unitPrice}
                        </p>
                        <p className="text-xs text-amber-700 font-semibold">₹{item.subtotal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="bg-amber-50/50 p-4 rounded-xl flex items-center justify-between border border-amber-200/50">
                <div>
                  <p className="font-bold text-stone-800">
                    Payment Method: <span className="text-amber-900">{selectedOrder.paymentMethod}</span>
                  </p>
                  <p className="text-stone-600 text-[11px]">
                    Status: <span className="font-bold">{selectedOrder.paymentStatus}</span> (Admin verified)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">Grand Total</span>
                  <p className="text-lg font-serif font-bold text-stone-900">₹{selectedOrder.grandTotal}</p>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="pt-2">
                <label className="block font-bold text-stone-700 text-xs mb-1">Advance Kitchen Order Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedOrder.orderStatus === st
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REVIEW CUSTOM CAKE */}
      {/* ========================================================================= */}
      {reviewCake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Review & Quote Custom Cake #{reviewCake.id}
                </h3>
                <p className="text-xs text-stone-500">
                  {reviewCake.cakeType} • {reviewCake.weight}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewCake(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Decision Status *</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value as CustomCakeStatus })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900 font-semibold"
                >
                  <option value="APPROVED">APPROVED (Feasible & Quoted)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Checking ingredients/mold)</option>
                  <option value="CHANGES_REQUESTED">CHANGES REQUESTED (Modification required)</option>
                  <option value="REJECTED">REJECTED (Cannot be fulfilled)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Feasibility Assessment *</label>
                <select
                  value={reviewForm.feasibilityDecision}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      feasibilityDecision: e.target.value as FeasibilityDecision,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900"
                >
                  <option value="FEASIBLE">100% Feasible</option>
                  <option value="MINOR_ADJUSTMENTS_REQUIRED">Minor Adjustments Required</option>
                  <option value="NOT_FEASIBLE">Not Feasible</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Confirmed Quote Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={reviewForm.confirmedPrice}
                  onChange={(e) => setReviewForm({ ...reviewForm, confirmedPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900 font-bold"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Estimated budget: ₹{reviewCake.estimatedPrice || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Bakery Kitchen Notes & Instructions</label>
                <textarea
                  rows={3}
                  value={reviewForm.bakeryNotes}
                  onChange={(e) => setReviewForm({ ...reviewForm, bakeryNotes: e.target.value })}
                  placeholder="Notes for the customer or internal baker instructions..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-ring text-stone-900"
                />
              </div>

              <div className="p-4 border-t border-stone-200 -mx-6 -mb-6 bg-stone-50 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReviewCake(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Submit Review Quote
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX IMAGE PREVIEW */}
      {/* ========================================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden p-2">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
            <div className="p-3 text-center text-white text-xs font-semibold">{previewImage.title}</div>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default ShopkeeperDashboard
