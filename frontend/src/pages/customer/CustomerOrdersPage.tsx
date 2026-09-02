import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { orderService } from '@/features/checkout/services/orderService'
import type { Order, OrderStatus } from '@/features/checkout/types'
import { Button } from '@/components/ui/Button'
import {
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react'


const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'Order Confirmed', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case 'PREPARING':
      return { label: 'Baking in Kitchen', icon: Sparkles, className: 'bg-amber-100 text-amber-800 border-amber-200' }
    case 'READY':
      return { label: 'Ready for Pickup / Dispatch', icon: CheckCircle2, className: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', icon: Truck, className: 'bg-purple-100 text-purple-800 border-purple-200' }
    case 'DELIVERED':
      return { label: 'Delivered', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case 'CANCELLED':
      return { label: 'Cancelled', icon: AlertCircle, className: 'bg-red-100 text-red-800 border-red-200' }
    case 'AWAITING_PAYMENT':
    default:
      return { label: 'Awaiting Payment', icon: Clock, className: 'bg-amber-100 text-amber-800 border-amber-200' }
  }
}

export const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    document.title = "My Orders | Payal's Bakery Cottage"
    const loadOrders = async () => {
      setLoading(true)
      try {
        const list = await orderService.getMyOrders(user?.id)
        setOrders(list)
      } catch (err) {
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-stone-50/50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/customer/dashboard" className="hover:text-amber-800 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800">My Orders</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
              Order History
            </span>
            <h1 className="text-3xl font-bold font-serif text-stone-900">
              My Orders ({orders.length})
            </h1>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm" className="border-amber-200 text-stone-700 rounded-xl">
              Browse More Bakes
            </Button>
          </Link>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-amber-100 p-6" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getOrderStatusBadge(order.orderStatus)
              const BadgeIcon = badge.icon

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-amber-100/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-serif text-stone-900">
                          Order #{order.orderNumber}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-stone-500 block">Total Amount</span>
                      <span className="text-lg font-extrabold text-amber-800 font-serif">
                        ₹{order.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50/30 border border-amber-100/60 text-xs"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 rounded-xl object-cover border border-amber-100 bg-white shrink-0"
                        />
                        <div className="truncate">
                          <strong className="text-stone-900 block truncate">{item.productName}</strong>
                          <span className="text-[11px] text-stone-500">
                            {item.quantity} × ₹{item.unitPrice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-stone-500 border-t border-stone-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Delivery: <strong>{order.preferredDeliveryDate}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        {order.preferredDeliveryTime.split(' ')[0]}
                      </span>
                    </div>

                    <Link to={`/customer/orders/${order.id}`}>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs">
                        View Order Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty Orders State */
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-amber-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-stone-900">No Orders Placed Yet</h3>
            <p className="mt-2 text-xs text-stone-500 max-w-sm">
              You haven't placed any orders yet. Browse our freshly baked 100% eggless cakes and artisanal bakes!
            </p>
            <Link to="/products" className="mt-6">
              <Button size="sm" className="bg-amber-600 text-white rounded-xl">
                Browse Fresh Bakes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
export default CustomerOrdersPage
