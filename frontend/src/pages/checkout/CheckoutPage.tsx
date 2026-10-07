import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import { addressService } from '@/features/checkout/services/addressService'
import { orderService } from '@/features/checkout/services/orderService'
import type { DeliveryAddress, DeliveryTimeSlot, PaymentMethodType } from '@/features/checkout/types'
import { Button } from '@/components/ui/Button'
import {
  MapPin,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Plus,
  Info,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const DELIVERY_TIMES: DeliveryTimeSlot[] = [
  'Morning (10:00 AM – 01:00 PM)',
  'Afternoon (01:00 PM – 05:00 PM)',
  'Evening (05:00 PM – 08:00 PM)',
]

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const { items, summary, clearCart } = useCart()
  const navigate = useNavigate()

  // Addresses
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false)

  // New Address Form State
  const [newAddress, setNewAddress] = useState<Omit<DeliveryAddress, 'id'>>({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    addressLine: '',
    areaLocality: '',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700123',
    landmark: '',
    isDefault: true,
  })
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})

  // Preferred Delivery Schedule (min tomorrow for 24-hr advance order)
  const tomorrowStr = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()

  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState<string>(tomorrowStr)
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState<DeliveryTimeSlot>(
    'Evening (05:00 PM – 08:00 PM)'
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI_QR')
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false)

  // Load Saved Addresses
  useEffect(() => {
    document.title = "Checkout | Payal's Bakery Cottage"
    const loadAddresses = async () => {
      const list = await addressService.getAddresses(user?.id)
      setAddresses(list)
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0]
        setSelectedAddressId(defaultAddr.id)
      }
    }
    loadAddresses()
  }, [user?.id])

  // Handle New Address Submission
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = addressService.validateIndianAddress(newAddress)
    if (!validation.isValid) {
      setAddressErrors(validation.errors)
      toast.error('Please fix the errors in the address form.')
      return
    }

    try {
      const saved = await addressService.saveAddress(newAddress, user?.id)
      const updatedList = await addressService.getAddresses(user?.id)
      setAddresses(updatedList)
      setSelectedAddressId(saved.id)
      setShowAddressModal(false)
      toast.success('Delivery address saved successfully!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address.'
      toast.error(msg)
    }
  }

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.')
      navigate('/products')
      return
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address.')
      setShowAddressModal(true)
      return
    }

    if (!preferredDeliveryDate) {
      toast.error('Please select your preferred delivery date.')
      return
    }

    setIsPlacingOrder(true)
    try {
      const order = await orderService.createOrder(
        {
          items,
          deliveryAddress: selectedAddress,
          preferredDeliveryDate,
          preferredDeliveryTime,
          paymentMethod,
        },
        user?.id
      )

      await clearCart()
      toast.success(`Order #${order.orderNumber} created! Proceeding to payment confirmation...`)
      navigate(`/customer/orders/${order.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order.'
      toast.error(msg)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Empty Cart Guard
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50/50 py-16 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Your Cart is Empty</h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            Please add some fresh cakes or bakes to your cart before proceeding to checkout.
          </p>
          <Link to="/products" className="mt-6 inline-block">
            <Button size="md" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
              Browse Products <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  return (
    <div className="min-h-screen bg-stone-50/50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/cart" className="hover:text-amber-800 transition-colors">
            Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800">Checkout</span>
        </nav>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
            Secure Bakery Checkout
          </span>
          <h1 className="text-3xl font-bold font-serif text-stone-900">
            Finalize Your Bakery Order
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                    Delivery Address
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressModal(true)}
                  className="border-amber-200 text-amber-800 hover:bg-amber-50 rounded-xl text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
                </Button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className="text-xs sm:text-sm font-bold text-stone-900">
                          {addr.fullName}
                        </strong>
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {addr.addressLine}, {addr.areaLocality}
                      </p>
                      <p className="text-xs text-stone-600">
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-2 font-mono">
                        Phone: {addr.phoneNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50/50 border border-dashed border-amber-200 text-center space-y-2">
                  <MapPin className="w-6 h-6 text-amber-700 mx-auto" />
                  <p className="text-xs text-stone-600">
                    No delivery addresses found. Please add your address to continue.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                    className="bg-amber-600 text-white rounded-xl text-xs"
                  >
                    Add Delivery Address
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2: Preferred Delivery Schedule */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                  Preferred Delivery Schedule
                </h2>
              </div>

              {/* Advance Notice Rule Advisory */}
              <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/80 flex items-start gap-2.5 text-xs text-stone-700">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Advance Order Rule:</strong> Artisanal home bakes are prepared fresh to order. Please order at least 24 hours in advance. Preferred time is a request confirmed by the bakery.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-1.5">
                    Preferred Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={preferredDeliveryDate}
                      onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-amber-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Calendar className="w-4 h-4 text-amber-700 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-1.5">
                    Preferred Time Window
                  </label>
                  <div className="relative">
                    <select
                      value={preferredDeliveryTime}
                      onChange={(e) => setPreferredDeliveryTime(e.target.value as DeliveryTimeSlot)}
                      className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-amber-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {DELIVERY_TIMES.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <Clock className="w-4 h-4 text-amber-700 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                  Payment Method Selection
                </h2>
              </div>

              <div className="pt-2">
                <div
                  onClick={() => setPaymentMethod('UPI_QR')}
                  className="p-4 rounded-2xl border-2 border-amber-600 bg-amber-50/40 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-stone-900 block">
                        Bakery UPI / QR Code Payment (Recommended)
                      </strong>
                      <span className="text-[11px] text-stone-500">
                        Scan & pay securely via GPay, PhonePe, Paytm or any UPI app in next step
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl bg-white p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="text-lg font-bold font-serif text-stone-900">Order Summary</h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  {summary.totalItems} Items
                </span>
              </div>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-100 bg-amber-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-stone-500">
                        {item.quantity} × ₹{item.unitPrice} ({item.weightOption})
                      </p>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-stone-100 pt-4">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-stone-900">
                    ₹{summary.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges</span>
                  <span className="text-amber-800 font-medium italic">Calculated by bakery</span>
                </div>

                <div className="border-t border-amber-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-amber-800 font-serif">
                    ₹{summary.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Destination preview */}
              {selectedAddress && (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-[11px] text-stone-600">
                  <strong className="text-stone-900 block mb-0.5">Delivering To:</strong>
                  {selectedAddress.fullName}, {selectedAddress.city} - {selectedAddress.pincode}
                </div>
              )}

              {/* Proceed Action Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || addresses.length === 0}
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md py-3.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isPlacingOrder ? 'Creating Order...' : 'Proceed to Payment'}</span>
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure Checkout • Fresh Daily Bakes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowAddressModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 animate-scaleUp space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Add New Delivery Address
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                    placeholder="Recipient's Name"
                  />
                  {addressErrors.fullName && (
                    <span className="text-[10px] text-red-500">{addressErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    10-Digit Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newAddress.phoneNumber}
                    onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 9876543210"
                  />
                  {addressErrors.phoneNumber && (
                    <span className="text-[10px] text-red-500">{addressErrors.phoneNumber}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Street Address / House No. / Flat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. 113/A, Natunpara"
                />
                {addressErrors.addressLine && (
                  <span className="text-[10px] text-red-500">{addressErrors.addressLine}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Area / Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.areaLocality}
                    onChange={(e) => setNewAddress({ ...newAddress, areaLocality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Muktapukur, Barrackpore"
                  />
                  {addressErrors.areaLocality && (
                    <span className="text-[10px] text-red-500">{addressErrors.areaLocality}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    6-Digit Postal PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="700123"
                  />
                  {addressErrors.pincode && (
                    <span className="text-[10px] text-red-500">{addressErrors.pincode}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressModal(false)}
                  className="w-1/2 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                >
                  Save & Use Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default CheckoutPage
