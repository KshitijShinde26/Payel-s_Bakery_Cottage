import React from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Truck,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/features/checkout/types'

interface CustomerRecentOrdersProps {
  orders: Order[]
}

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'Order Confirmed', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
    case 'PREPARING':
      return { label: 'Baking in Oven', icon: Sparkles, className: 'bg-amber-50 text-amber-800 border-amber-200' }
    case 'READY':
      return { label: 'Ready for Dispatch', icon: Package, className: 'bg-blue-50 text-blue-800 border-blue-200' }
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', icon: Truck, className: 'bg-purple-50 text-purple-800 border-purple-200' }
    case 'DELIVERED':
      return { label: 'Delivered', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
    case 'CANCELLED':
      return { label: 'Cancelled', icon: AlertCircle, className: 'bg-red-50 text-red-800 border-red-200' }
    case 'AWAITING_PAYMENT':
    default:
      return { label: 'Awaiting Payment', icon: Clock, className: 'bg-amber-100 text-amber-800 border-amber-300' }
  }
}

export const CustomerRecentOrders: React.FC<CustomerRecentOrdersProps> = ({ orders }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Order History
          </span>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            Recent Orders
          </h2>
        </div>

        <Link
          to="/customer/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
        >
          <span>View All ({orders.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.orderStatus)
            const BadgeIcon = badge.icon

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl border border-amber-100/80 hover:border-amber-200 transition-all bg-white hover:bg-amber-50/20 shadow-2xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      Order #{order.orderNumber}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="font-serif font-extrabold text-amber-800 text-base">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items list preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded-2xl bg-amber-50/40 border border-amber-100/60"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-9 h-9 rounded-xl object-cover bg-white shrink-0 border border-amber-100"
                      />
                      <div className="truncate">
                        <span className="font-semibold text-stone-900 block truncate text-[11px]">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {item.quantity} × ₹{item.unitPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-stone-500 border-t border-stone-100">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Delivery: <strong className="text-stone-800">{order.preferredDeliveryDate}</strong> ({order.preferredDeliveryTime.split(' ')[0]})
                  </span>

                  <Link
                    to={`/customer/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-amber-700 font-semibold hover:text-amber-800 text-xs self-end sm:self-auto"
                  >
                    <span>View Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Real Empty State */
        <div className="p-8 text-center bg-stone-50/50 rounded-3xl border border-dashed border-stone-200 space-y-2">
          <Package className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="text-sm font-semibold text-stone-800">No orders yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once you place your first order from our bakery catalog, your orders and receipts will appear here.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              <span>Explore Fresh Bakes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
