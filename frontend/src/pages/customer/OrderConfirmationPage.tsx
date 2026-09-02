import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { orderService } from '@/features/checkout/services/orderService'
import type { Order } from '@/features/checkout/types'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    document.title = "Order Details | Payal's Bakery Cottage"
    const loadOrder = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await orderService.getOrderById(id, user?.id)
        setOrder(data)
      } catch (err) {
        console.error('Failed to load order', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id, user?.id])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-stone-500 font-serif text-lg">Loading Order Details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-stone-50/50 py-16 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <h1 className="text-2xl font-bold font-serif text-stone-900">Order Not Found</h1>
          <p className="mt-2 text-xs text-stone-500">We couldn't locate the requested order details.</p>
          <Link to="/customer/orders" className="mt-6 inline-block">
            <Button size="sm" className="bg-amber-600 text-white rounded-xl">
              Go to My Orders
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/customer/orders" className="hover:text-amber-800 transition-colors">
            My Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800">Order #{order.orderNumber}</span>
        </nav>

        {/* Success Header Banner */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-amber-100/80 shadow-xs text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Awaiting Payment / Bakery Confirmation
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Order Received! #{order.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Thank you for ordering with Payal's Bakery Cottage. Your order has been placed and is currently awaiting payment verification.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
          {/* Schedule & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-stone-100 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Delivery Address
              </span>
              <p className="font-bold text-stone-900">{order.deliveryAddress.fullName}</p>
              <p className="text-stone-600">
                {order.deliveryAddress.addressLine}, {order.deliveryAddress.areaLocality}
              </p>
              <p className="text-stone-600">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
              <p className="text-stone-500 font-mono">Phone: {order.deliveryAddress.phoneNumber}</p>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-stone-100 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Preferred Delivery Schedule
              </span>
              <p className="font-bold text-stone-900">{order.preferredDeliveryDate}</p>
              <p className="text-stone-600">{order.preferredDeliveryTime}</p>
              <span className="text-[10px] text-stone-400 block pt-1">
                *Final time scheduled based on oven baking schedule
              </span>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/40 border border-amber-100/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-100 bg-white"
                    />
                    <div>
                      <h4 className="font-bold text-stone-900">{item.productName}</h4>
                      <p className="text-stone-500 text-[11px]">
                        {item.quantity} × ₹{item.unitPrice} ({item.weightOption})
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-stone-900 text-sm">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 text-xs border-t border-stone-100 pt-4">
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-stone-900">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Charges</span>
              <span className="text-amber-800 italic">{order.deliveryChargeText}</span>
            </div>
            <div className="border-t border-amber-100 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-900">Total Order Amount</span>
              <span className="text-2xl font-extrabold text-amber-800 font-serif">
                ₹{order.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Notice (Phase 6 demarcation) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-700 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block mb-0.5">UPI Payment Verification:</strong>
              Bakery UPI QR Code payment session and verification will be finalized in Phase 6. Your order has been registered in the kitchen queue.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/customer/orders" className="w-full sm:w-1/2">
              <Button variant="outline" size="sm" className="w-full border-amber-200 text-stone-700 rounded-xl">
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                View All My Orders
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-1/2">
              <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
                Continue Shopping <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default OrderConfirmationPage
