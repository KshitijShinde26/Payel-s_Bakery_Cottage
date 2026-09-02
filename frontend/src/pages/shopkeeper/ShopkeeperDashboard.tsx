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
} from '@/features/shopkeeper/types'
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
  IndianRupee,
  X,
  SlidersHorizontal,
  Package,
} from 'lucide-react'

const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PREPARING':
      return { label: 'Baking in Oven / Prep', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: Flame }
    case 'READY':
      return { label: 'Ready for Dispatch', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 }
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out with Courier', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck }
    case 'DELIVERED':
    case 'COMPLETED':
      return { label: 'Completed & Delivered', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 }
    case 'CONFIRMED':
    case 'PAYMENT_VERIFIED':
      return { label: 'Payment Verified', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock }
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

  // Data States
  const [orders, setOrders] = useState<Order[]>([])
  const [customCakes, setCustomCakes] = useState<CustomCakeRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Active View & Filter Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'custom_cakes' | 'all_orders'>('queue')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [cakeStatusFilter, setCakeStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Sync hash routing with active tab state
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase()
    if (hash === 'orders' || hash === 'all_orders') {
      setActiveTab('all_orders')
    } else if (hash === 'custom_cakes' || hash === 'cakes' || hash === 'custom') {
      setActiveTab('custom_cakes')
    } else if (hash === 'queue') {
      setActiveTab('queue')
    }
  }, [location.hash])

  // Modals / Drawers
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

  // Load live data
  const fetchData = async () => {
    try {
      const [ordersList, cakesList] = await Promise.all([
        shopkeeperService.getOrders(),
        shopkeeperService.getCustomCakes(),
      ])
      setOrders(ordersList)
      setCustomCakes(cakesList)
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
    toast.success('Kitchen queue & requests updated!')
  }

  // Quick Order Status Transition
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, customNote?: string) => {
    try {
      const updated = await shopkeeperService.updateOrderStatus(orderId, {
        status: newStatus,
        kitchenNotes: customNote,
      })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated)
      }
      toast.success(`Order #${updated.orderNumber} shifted to ${newStatus.replace(/_/g, ' ')}!`)
    } catch {
      toast.error('Failed to update order status.')
    }
  }

  // Open Custom Cake Review Modal
  const handleOpenReview = (cake: CustomCakeRequest) => {
    setReviewCake(cake)
    setReviewForm({
      status: cake.status === 'PENDING_REVIEW' ? 'APPROVED' : cake.status,
      confirmedPrice: cake.confirmedPrice || cake.estimatedPrice || 1200,
      feasibilityDecision: (cake.bakeryNotes ? 'FEASIBLE' : 'FEASIBLE') as FeasibilityDecision,
      bakeryNotes: cake.bakeryNotes || 'Bake ready: All design requirements verified by kitchen chef.',
    })
  }

  // Submit Custom Cake Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewCake) return

    try {
      const updated = await shopkeeperService.reviewCustomCake(reviewCake.id, {
        status: reviewForm.status,
        confirmedPrice: Number(reviewForm.confirmedPrice),
        estimatedPrice: reviewCake.estimatedPrice,
        feasibilityDecision: reviewForm.feasibilityDecision,
        bakeryNotes: reviewForm.bakeryNotes,
      })

      setCustomCakes((prev) => prev.map((c) => (c.id === reviewCake.id ? updated : c)))
      setReviewCake(null)
      toast.success(`Custom cake #${reviewCake.id.slice(-6)} reviewed successfully!`)
    } catch {
      toast.error('Failed to submit custom cake review.')
    }
  }

  // Metrics Calculation
  const stats = useMemo(() => {
    const todayTotal = orders.length
    const inPreparation = orders.filter((o) => o.orderStatus === 'PREPARING').length
    const readyForDispatch = orders.filter((o) => o.orderStatus === 'READY').length
    const outForDelivery = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length
    const completedToday = orders.filter((o) => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length
    const pendingCustomCakes = customCakes.filter(
      (c) => c.status === 'PENDING_REVIEW' || c.status === 'UNDER_REVIEW'
    ).length

    return {
      todayTotal,
      inPreparation,
      readyForDispatch,
      outForDelivery,
      completedToday,
      pendingCustomCakes,
    }
  }, [orders, customCakes])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === 'ALL'
          ? true
          : orderStatusFilter === 'ACTIVE_QUEUE'
          ? ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order.orderStatus)
          : order.orderStatus === orderStatusFilter

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.deliveryAddress?.fullName?.toLowerCase().includes(q) ||
        order.items.some((item) => item.productName.toLowerCase().includes(q))

      return matchesStatus && matchesSearch
    })
  }, [orders, orderStatusFilter, searchQuery])

  // Filtered Custom Cakes
  const filteredCustomCakes = useMemo(() => {
    return customCakes.filter((cake) => {
      const matchesStatus = cakeStatusFilter === 'ALL' || cake.status === cakeStatusFilter
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        cake.cakeType.toLowerCase().includes(q) ||
        cake.flavor.toLowerCase().includes(q) ||
        cake.customMessage?.toLowerCase().includes(q) ||
        cake.id.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [customCakes, cakeStatusFilter, searchQuery])

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-stone-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Kitchen Operations Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Bakery Manager'}
            </h1>
            <p className="mt-2 text-stone-300 text-sm leading-relaxed">
              Track kitchen preparation queues, expedite baking schedules, and approve custom cake pricing & feasibility requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Board'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom_cakes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Review Custom Cakes ({stats.pendingCustomCakes})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Today's Orders", value: stats.todayTotal, icon: ClipboardList, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'In Kitchen Prep', value: stats.inPreparation, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Cake Reviews', value: stats.pendingCustomCakes, icon: CakeSlice, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Ready for Dispatch', value: stats.readyForDispatch, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Out for Delivery', value: stats.outForDelivery, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Completed Today', value: stats.completedToday, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-serif text-stone-900">{stat.value}</span>
                <p className="text-[10px] text-stone-400 mt-0.5">Live sync active</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'queue'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-amber-50 hover:text-amber-900 border border-stone-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Active Kitchen Queue</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'queue' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {stats.inPreparation + stats.readyForDispatch}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom_cakes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'custom_cakes'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-amber-50 hover:text-amber-900 border border-stone-200'
            }`}
          >
            <CakeSlice className="w-4 h-4" />
            <span>Custom Cake Requests</span>
            {stats.pendingCustomCakes > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {stats.pendingCustomCakes} New
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'all_orders'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-amber-50 hover:text-amber-900 border border-stone-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>All Customer Orders</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'all_orders' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {orders.length}
            </span>
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'custom_cakes' ? 'Search custom cakes...' : 'Search order #, customer...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KITCHEN PREPARATION QUEUE & DISPATCH BOARD */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Sub-filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>Queue Filter:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'CONFIRMED', label: 'Payment Verified' },
                { id: 'PREPARING', label: 'In Kitchen Prep' },
                { id: 'READY', label: 'Ready for Dispatch' },
                { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderStatusFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 bg-white rounded-3xl border border-stone-200" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                const badge = getOrderStatusBadge(order.orderStatus)
                const BadgeIcon = badge.icon

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-stone-200 hover:border-amber-400 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-stone-950">{order.orderNumber}</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                              <BadgeIcon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="font-medium text-amber-900">{order.paymentMethod.replace(/_/g, ' ')}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold font-serif text-stone-900">
                            ₹{order.grandTotal.toFixed(2)}
                          </span>
                          <span className={`block text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Delivery Slot Details */}
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50/70 p-3 rounded-2xl my-3 border border-stone-100">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">Customer</span>
                          <p className="font-bold text-stone-800 mt-0.5">{order.deliveryAddress?.fullName || 'Customer'}</p>
                          <a
                            href={`tel:${order.deliveryAddress?.phoneNumber}`}
                            className="text-[11px] text-amber-700 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {order.deliveryAddress?.phoneNumber}
                          </a>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">Target Delivery</span>
                          <p className="font-bold text-stone-800 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            {order.preferredDeliveryDate || 'Today'}
                          </p>
                          <p className="text-[11px] text-stone-500">{order.preferredDeliveryTime || 'Standard Slot'}</p>
                        </div>
                      </div>

                      {/* Itemized Line Items */}
                      <div className="space-y-2 mb-4">
                        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                          Bakery Line Items ({order.items.length}):
                        </span>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                              <div className="flex items-center gap-2.5">
                                {item.productImage && (
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-stone-900">{item.productName}</p>
                                  <p className="text-[10px] text-stone-500">
                                    Option: {item.weightOption} • Qty: <span className="font-bold text-amber-800">{item.quantity}</span>
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-stone-800">₹{item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fast Status Action Workflow Controls */}
                    <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-800 p-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Full Details</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.orderStatus === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Start Baking</span>
                          </button>
                        )}

                        {order.orderStatus === 'PREPARING' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'READY')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Ready</span>
                          </button>
                        )}

                        {order.orderStatus === 'READY' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch Courier</span>
                          </button>
                        )}

                        {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Delivered</span>
                          </button>
                        )}

                        {order.orderStatus === 'DELIVERED' && (
                          <span className="text-xs font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                            Completed & Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold font-serif text-stone-800">No active kitchen orders found</h3>
              <p className="text-xs text-stone-500 mt-1">Orders with matching filters or search queries will appear here.</p>
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter('ALL')
                  setSearchQuery('')
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOM CAKE REQUESTS REVIEW PANEL */}
      {/* ========================================================================= */}
      {activeTab === 'custom_cakes' && (
        <div className="space-y-6">
          {/* Sub-filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <CakeSlice className="w-3.5 h-3.5 text-amber-700" />
              <span>Review Filter:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Requests' },
                { id: 'PENDING_REVIEW', label: 'Pending Review' },
                { id: 'UNDER_REVIEW', label: 'Under Review' },
                { id: 'APPROVED', label: 'Approved & Quoted' },
                { id: 'CHANGES_REQUESTED', label: 'Changes Suggested' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCakeStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    cakeStatusFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Cake Cards */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-white rounded-3xl border border-stone-200" />
              ))}
            </div>
          ) : filteredCustomCakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomCakes.map((cake) => {
                const badge = getCustomCakeBadge(cake.status)

                return (
                  <div
                    key={cake.id}
                    className="bg-white rounded-3xl border border-stone-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail & Header */}
                      <div className="relative rounded-2xl overflow-hidden mb-4 bg-stone-100 aspect-video group">
                        {cake.referenceImageUrl ? (
                          <>
                            <img
                              src={cake.referenceImageUrl}
                              alt={cake.cakeType}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: cake.referenceImageUrl, title: `${cake.cakeType} Reference` })}
                              className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs transition-opacity"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Reference Photo</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                            <CakeSlice className="w-8 h-8 mb-1" />
                            <span className="text-[11px]">No Reference Photo</span>
                          </div>
                        )}

                        <div className="absolute top-2 left-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Cake Specifications */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-serif font-bold text-stone-900">{cake.cakeType}</h3>
                            <p className="text-xs text-amber-800 font-semibold">{cake.flavor}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-stone-900 font-serif">
                              ₹{(cake.confirmedPrice || cake.estimatedPrice || 0).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-stone-400 block">{cake.confirmedPrice ? 'Quoted' : 'Est. Price'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase font-bold">Weight</span>
                            <span className="font-bold text-stone-800">{cake.weight}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase font-bold">Dietary</span>
                            <span className="font-bold text-stone-800">{cake.dietaryPreference}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-stone-400 block text-[9px] uppercase font-bold">Preferred Slot</span>
                            <span className="font-semibold text-stone-700">
                              {cake.preferredDeliveryDate} • {cake.preferredDeliveryTime}
                            </span>
                          </div>
                        </div>

                        {cake.customMessage && (
                          <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                            <span className="text-[10px] font-bold uppercase text-amber-900 block">Plaque Message:</span>
                            <p className="italic text-stone-700 mt-0.5">"{cake.customMessage}"</p>
                          </div>
                        )}

                        {cake.specialInstructions && (
                          <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                            <span className="font-semibold text-stone-800">Instructions: </span>
                            {cake.specialInstructions}
                          </p>
                        )}

                        {cake.bakeryNotes && (
                          <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                            <span className="text-[10px] font-bold uppercase block">Bakery Notes:</span>
                            <p className="text-[11px] mt-0.5">{cake.bakeryNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(cake)}
                        className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{cake.confirmedPrice ? 'Update Pricing & Review' : 'Review & Quote Price'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
              <CakeSlice className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold font-serif text-stone-800">No custom cake requests found</h3>
              <p className="text-xs text-stone-500 mt-1">Customer reference photos and requests will appear here for pricing validation.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL ORDERS MASTER LIST */}
      {/* ========================================================================= */}
      {activeTab === 'all_orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-stone-900">All Registered Orders</h2>
            <span className="text-xs text-stone-500">Total: {filteredOrders.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Order #</th>
                  <th className="px-5 py-3.5 font-bold">Customer</th>
                  <th className="px-5 py-3.5 font-bold">Items</th>
                  <th className="px-5 py-3.5 font-bold">Total</th>
                  <th className="px-5 py-3.5 font-bold">Payment</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const badge = getOrderStatusBadge(order.orderStatus)
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-stone-900">{order.orderNumber}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-stone-800">{order.deliveryAddress?.fullName || 'Customer'}</p>
                        <p className="text-[10px] text-stone-400">{order.deliveryAddress?.city || 'Pune'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="truncate max-w-[200px] font-medium text-stone-800">
                          {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-bold font-serif text-stone-900">₹{order.grandTotal.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-semibold text-xs transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CUSTOM CAKE REVIEW & PRICING DRAWER */}
      {/* ========================================================================= */}
      {reviewCake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">Review Custom Cake Request</h3>
                <p className="text-xs text-stone-500">Submit feasibility decision, verified quote, and chef baking notes</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewCake(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              {/* Reference Image Preview */}
              {reviewCake.referenceImageUrl && (
                <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-video max-h-48">
                  <img
                    src={reviewCake.referenceImageUrl}
                    alt="Reference Design"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-lg">
                    Customer Photo: {reviewCake.referenceImageName || 'design_ref.jpg'}
                  </div>
                </div>
              )}

              {/* Cake Spec Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Type</span>
                  <span className="font-bold text-stone-900">{reviewCake.cakeType}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Flavor</span>
                  <span className="font-bold text-stone-900">{reviewCake.flavor}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Weight</span>
                  <span className="font-bold text-stone-900">{reviewCake.weight}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Dietary</span>
                  <span className="font-bold text-stone-900">{reviewCake.dietaryPreference}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Target Delivery</span>
                  <span className="font-bold text-stone-900">{reviewCake.preferredDeliveryDate} ({reviewCake.preferredDeliveryTime})</span>
                </div>
              </div>

              {reviewCake.specialInstructions && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Special Instructions:</span>
                  <p className="text-stone-700">{reviewCake.specialInstructions}</p>
                </div>
              )}

              {/* Form Input 1: Confirmed Price */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Bakery Quoted Price (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={reviewForm.confirmedPrice}
                    onChange={(e) => setReviewForm({ ...reviewForm, confirmedPrice: Number(e.target.value) })}
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-bold text-stone-900 rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter quoted price in ₹"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Calculated based on weight, multi-tier structure, and fondant complexity.</p>
              </div>

              {/* Form Input 2: Feasibility & Review Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Feasibility Decision *
                  </label>
                  <select
                    value={reviewForm.feasibilityDecision}
                    onChange={(e) => setReviewForm({ ...reviewForm, feasibilityDecision: e.target.value as FeasibilityDecision })}
                    className="w-full px-3 py-2.5 text-xs font-semibold text-stone-900 rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="FEASIBLE">100% Feasible for Kitchen</option>
                    <option value="MINOR_ADJUSTMENTS_REQUIRED">Minor Adjustments Required</option>
                    <option value="NOT_FEASIBLE">Not Feasible (Declined)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Approval Status *
                  </label>
                  <select
                    value={reviewForm.status}
                    onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value as CustomCakeStatus })}
                    className="w-full px-3 py-2.5 text-xs font-semibold text-stone-900 rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="APPROVED">Approve & Send Quote to Customer</option>
                    <option value="UNDER_REVIEW">Keep Under Kitchen Review</option>
                    <option value="CHANGES_REQUESTED">Request Customer Modification</option>
                    <option value="REJECTED">Decline Custom Order</option>
                  </select>
                </div>
              </div>

              {/* Form Input 3: Bakery Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Bakery Kitchen Notes & Customer Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewForm.bakeryNotes}
                  onChange={(e) => setReviewForm({ ...reviewForm, bakeryNotes: e.target.value })}
                  placeholder="e.g., We can recreate this 2-tier galaxy cake using edible glitter and handmade chocolate astronaut figurines."
                  className="w-full px-3 py-2 text-xs text-stone-900 rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewCake(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="md" className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white">
                  Save & Notify Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ORDER MANAGEMENT & DISPATCH MODAL */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">Manage Order {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-stone-500">Fulfillment, delivery address, and live status dispatch</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Delivery Address & Customer */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{selectedOrder.deliveryAddress?.fullName}</span>
                  <a
                    href={`tel:${selectedOrder.deliveryAddress?.phoneNumber}`}
                    className="text-amber-800 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selectedOrder.deliveryAddress?.phoneNumber}
                  </a>
                </div>
                <p className="text-stone-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.deliveryAddress?.addressLine}, {selectedOrder.deliveryAddress?.areaLocality},{' '}
                    {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.pincode}
                  </span>
                </p>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Ordered Items</h4>
                <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{item.productName}</p>
                        <p className="text-[10px] text-stone-500">Option: {item.weightOption} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold font-serif text-stone-900">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-stone-50 flex items-center justify-between text-xs font-bold">
                    <span>Grand Total</span>
                    <span className="text-base font-serif text-amber-900">₹{selectedOrder.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Update Order Pipeline Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedOrder.orderStatus === st
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-900'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FULL SCREEN IMAGE PREVIEW */}
      {/* ========================================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-stone-700"
            />
            <span className="text-white text-xs mt-3 font-semibold">{previewImage.title}</span>
          </div>
        </div>
      )}
    </div>
  )
}
export default ShopkeeperDashboard
