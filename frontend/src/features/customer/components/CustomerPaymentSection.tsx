import React, { useState } from 'react'
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  Info,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Order } from '@/features/checkout/types'
import type { CustomerPayment } from '../types'
import { customerService } from '../services/customerService'

interface CustomerPaymentSectionProps {
  orders: Order[]
  payments: CustomerPayment[]
  onPaymentSubmitted: () => void
}

export const CustomerPaymentSection: React.FC<CustomerPaymentSectionProps> = ({
  orders,
  payments,
  onPaymentSubmitted,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [utrNumber, setUtrNumber] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Orders that are currently awaiting payment or have pending payment status
  const pendingOrders = orders.filter((o) => {
    const payment = payments.find((p) => p.orderId === o.id)
    return (
      o.paymentStatus === 'PENDING' ||
      o.orderStatus === 'AWAITING_PAYMENT' ||
      (payment && payment.status === 'PENDING')
    )
  })

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrderId) {
      toast.error('Please select an order to submit payment for.')
      return
    }

    const trimmedUtr = utrNumber.trim()
    if (!trimmedUtr || trimmedUtr.length < 6) {
      toast.error('Please enter a valid 12-digit UPI UTR / Transaction Reference number.')
      return
    }

    const targetOrder = orders.find((o) => o.id === selectedOrderId)
    if (!targetOrder) {
      toast.error('Selected order not found.')
      return
    }

    setIsSubmitting(true)
    try {
      await customerService.submitPayment({
        orderId: targetOrder.id,
        amount: targetOrder.grandTotal,
        paymentMethod: targetOrder.paymentMethod || 'UPI_QR',
        transactionRef: trimmedUtr,
      })
      toast.success(`Payment details submitted for Order #${targetOrder.orderNumber}! Admin will verify shortly.`)
      setUtrNumber('')
      setSelectedOrderId('')
      onPaymentSubmitted()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit payment details.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPaymentStatusBadge = (status: CustomerPayment['status']) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Verified by Bakery',
          icon: CheckCircle2,
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        }
      case 'VERIFICATION_REQUIRED':
        return {
          label: 'Payment Verification Pending',
          icon: Clock,
          className: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
        }
      case 'REJECTED':
        return {
          label: 'Payment Rejected / Failed',
          icon: XCircle,
          className: 'bg-red-50 text-red-800 border-red-200',
        }
      case 'PENDING':
      default:
        return {
          label: 'Awaiting Payment Details',
          icon: AlertCircle,
          className: 'bg-stone-100 text-stone-700 border-stone-200',
        }
    }
  }

  return (
    <div id="payments" className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            UPI Verification & Invoices
          </span>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            Payment Status & UTR Submission
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>Manual Admin Verification</span>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200 flex items-start gap-3 text-xs text-stone-700">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-stone-900 block">How Bakery UPI Payments Work:</strong>
          <span>
            1. Scan the bakery UPI QR code in your UPI app (GPay, PhonePe, Paytm, etc.).<br />
            2. Enter the exact order amount and complete transaction.<br />
            3. Enter the 12-digit UTR / Reference number below. Admin verifies within kitchen operating hours to start baking!
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Submit UTR Form */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-amber-50/30 border border-amber-200/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <QrCode className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-serif font-bold text-stone-900">
              Submit Payment Reference (UTR)
            </h3>
          </div>

          {pendingOrders.length > 0 ? (
            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  Select Order for Payment <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-white text-stone-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Choose Order --</option>
                  {pendingOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.orderNumber} (₹{o.grandTotal.toLocaleString('en-IN')}) — {o.preferredDeliveryDate}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-white text-stone-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Found in your UPI app payment receipt details (Google Pay / PhonePe / Paytm)
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedOrderId || !utrNumber.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting UTR...' : 'Submit Payment for Verification'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-6 text-xs text-stone-500 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <strong className="text-stone-800 block">No Pending Payment Actions</strong>
              <span>All your placed orders have payment verified or under review.</span>
            </div>
          )}
        </div>

        {/* Right: Payment Records List */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-sm font-serif font-bold text-stone-900 pb-1">
            Submitted Payment Records ({payments.length})
          </h3>

          {payments.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {payments.map((p) => {
                const badge = getPaymentStatusBadge(p.status)
                const BadgeIcon = badge.icon

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white border border-amber-100 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-serif text-stone-900">
                        Order #{p.orderNumber}
                      </strong>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span>Amount: <strong className="text-amber-900">₹{p.amount?.toLocaleString('en-IN')}</strong></span>
                      <span className="font-mono text-[11px]">UTR: {p.transactionRef || 'N/A'}</span>
                    </div>

                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                      Submitted on {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
              <CreditCard className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
              <span>No payment transactions recorded yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
