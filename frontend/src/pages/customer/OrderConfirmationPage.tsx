import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { orderService } from '@/features/checkout/services/orderService'
import { customerService } from '@/features/customer/services/customerService'
import { DeliveryHandoverOtpCard } from '@/features/customer/components/DeliveryHandoverOtpCard'
import type { Order } from '@/features/checkout/types'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  QrCode,
  Send,
  ShieldCheck,
  Truck,
  Phone,
} from 'lucide-react'

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [utrNumber, setUtrNumber] = useState<string>('')
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false)
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING')

  const loadOrder = async () => {
    if (!id) return
    try {
      const data = await orderService.getOrderById(id, user?.id)
      setOrder(data)
      if (data?.paymentStatus) {
        setPaymentStatus(data.paymentStatus)
      }
    } catch (err) {
      console.error('Failed to load order', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = "Order Details & Payment | Payal's Bakery Cottage"
    loadOrder()
  }, [id, user?.id])

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    const trimmed = utrNumber.trim()
    if (!trimmed || trimmed.length < 6) {
      toast.error('Please enter a valid 12-digit UPI UTR / Transaction Reference number.')
      return
    }

    setIsSubmittingUtr(true)
    try {
      await customerService.submitPayment({
        orderId: order.id,
        amount: order.grandTotal,
        paymentMethod: order.paymentMethod || 'UPI_QR',
        transactionRef: trimmed,
      })
      toast.success('Payment UTR reference submitted successfully! Admin will verify shortly.')
      setPaymentStatus('VERIFICATION_REQUIRED')
      setUtrNumber('')
      loadOrder()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit payment reference.'
      toast.error(msg)
    } finally {
      setIsSubmittingUtr(false)
    }
  }

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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            {paymentStatus === 'PAID' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800">Payment Verified by Bakery</span>
              </>
            ) : paymentStatus === 'VERIFICATION_REQUIRED' ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Payment Verification Pending</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Awaiting Payment / Bakery Confirmation</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Order Received! #{order.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Thank you for ordering with Payal's Bakery Cottage. Your order has been placed and registered in the kitchen queue.
          </p>
        </div>

        {/* Delivery Handover OTP Card / Delivered Status */}
        <div className="mb-6">
          <DeliveryHandoverOtpCard
            orderId={order.id}
            orderNumber={order.orderNumber}
            orderStatus={order.orderStatus}
            initialOtp={order.deliveryOtp}
            deliveredAt={order.deliveredAt}
            deliveryPartnerName={order.deliveryPartnerName}
          />
        </div>

        {/* Assigned Partner Info (When Confirmed / Preparing / Ready) */}
        {order.deliveryPartnerName && order.orderStatus !== 'OUT_FOR_DELIVERY' && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'COMPLETED' && (
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 mb-6 flex items-center justify-between gap-3 text-xs text-purple-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Assigned Delivery Partner</span>
                <p className="font-bold text-stone-900">{order.deliveryPartnerName}</p>
              </div>
            </div>
            {order.deliveryPartnerPhone && (
              <a
                href={`tel:${order.deliveryPartnerPhone}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-purple-800 border border-purple-200 font-semibold hover:bg-purple-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>
            )}
          </div>
        )}

        {/* UPI QR Code & Payment Action Card */}
        {order.paymentMethod === 'UPI_QR' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">
                    Bakery UPI QR Payment
                  </h2>
                  <span className="text-xs text-stone-500">
                    Scan with GPay, PhonePe, Paytm, or any UPI app
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Amount to Pay</span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-800 font-serif">
                  ₹{order.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* QR Image */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border border-amber-100 text-center">
                <img
                  src="/images/QR-CODE.jpeg"
                  alt="Bakery UPI QR Code"
                  className="w-56 h-auto max-w-full rounded-xl shadow-xs border border-stone-200 object-contain bg-white"
                />
                <span className="text-[11px] font-bold text-amber-900 mt-2 block">
                  Payal's Bakery Cottage Official UPI
                </span>
                <span className="text-[10px] text-stone-400">
                  Scan using any UPI App
                </span>
              </div>

              {/* Payment Instructions & UTR Form */}
              <div className="md:col-span-7 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-stone-700">
                  <strong className="text-stone-900 block flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    How to complete your payment:
                  </strong>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-1">
                    <li>Scan the QR code above using your preferred UPI app.</li>
                    <li>Pay the exact amount of <strong>₹{order.grandTotal.toLocaleString('en-IN')}</strong>.</li>
                    <li>Copy the 12-digit UPI UTR / Transaction Reference number from your payment receipt.</li>
                    <li>Enter the UTR below and submit for bakery verification.</li>
                  </ol>
                </div>

                {paymentStatus === 'PAID' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block font-bold">Payment Verified!</strong>
                      <span>Your payment has been approved by the bakery admin. Kitchen preparation is underway.</span>
                    </div>
                  </div>
                ) : paymentStatus === 'VERIFICATION_REQUIRED' ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <strong className="block font-bold">Payment Under Verification</strong>
                      <span>We received your payment reference. Admin will verify it shortly.</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUtrSubmit} className="space-y-3">
                    <div>
                      <label className="font-bold text-stone-800 block mb-1">
                        12-Digit UPI UTR / Transaction Reference ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={30}
                        placeholder="e.g. 423589124501"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white text-stone-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingUtr || !utrNumber.trim()}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingUtr ? 'Submitting Reference...' : 'Submit Payment Proof'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

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
