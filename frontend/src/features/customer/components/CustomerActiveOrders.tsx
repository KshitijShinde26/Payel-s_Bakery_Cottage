import React from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/features/checkout/types'

interface CustomerActiveOrdersProps {
  orders: Order[]
}

const STEPS: { status: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Baking in Oven', icon: Sparkles },
  { status: 'READY', label: 'Boxed & Ready', icon: Package },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
]

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'CONFIRMED':
      return 0
    case 'PREPARING':
      return 1
    case 'READY':
      return 2
    case 'OUT_FOR_DELIVERY':
      return 3
    case 'DELIVERED':
      return 4
    case 'AWAITING_PAYMENT':
    default:
      return 0
  }
}

export const CustomerActiveOrders: React.FC<CustomerActiveOrdersProps> = ({ orders }) => {
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  )

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Live Kitchen Tracker
            </span>
            {activeOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 animate-pulse">
                Live ({activeOrders.length})
              </span>
            )}
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            Active Order Status
          </h2>
        </div>

        <Link
          to="/customer/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 self-start sm:self-auto"
        >
          <span>All Orders</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activeOrders.length > 0 ? (
        <div className="space-y-6">
          {activeOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.orderStatus)

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl bg-amber-50/30 border border-amber-200/70 space-y-5"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-bold text-stone-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-2xs">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Delivery: <strong>{order.preferredDeliveryDate}</strong>
                    </span>
                    <span className="font-serif font-extrabold text-amber-900 text-sm">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress Step Bar */}
                <div className="py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2">
                    {STEPS.map((step, idx) => {
                      const StepIcon = step.icon
                      const isPast = idx < currentStepIdx
                      const isCurrent = idx === currentStepIdx

                      return (
                        <div key={step.status} className="flex flex-col items-center text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-sm scale-105'
                                : isPast
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-200 text-stone-400'
                            }`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[11px] mt-2 font-medium leading-tight ${
                              isCurrent
                                ? 'text-amber-900 font-bold'
                                : isPast
                                ? 'text-emerald-800 font-semibold'
                                : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Items preview snippet */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-amber-100/80 text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-amber-100 shrink-0"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-5 h-5 rounded object-cover"
                        />
                        <span className="truncate max-w-[140px] text-[11px] font-medium text-stone-800">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-stone-400">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-[11px] text-amber-700 font-semibold pl-1">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/customer/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-amber-800 font-semibold text-xs hover:bg-amber-50 border border-amber-200 transition-colors shadow-2xs shrink-0"
                  >
                    <span>View Tracking Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Purposeful Real Empty State */
        <div className="bg-amber-50/40 rounded-3xl p-8 text-center border border-dashed border-amber-200 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-800">
            No Active Orders in Kitchen
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            You don't have any orders currently baking or on their way. Browse our fresh daily catalog to place a new artisan order!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-xs transition-all"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Browse Bakery Menu</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
