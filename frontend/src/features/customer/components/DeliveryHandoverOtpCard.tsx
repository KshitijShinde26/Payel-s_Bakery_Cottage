import React, { useState, useEffect } from 'react'
import { Truck, Copy, Check, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react'
import { customerService } from '../services/customerService'
import type { DeliveryOtpResponse } from '../types'
import toast from 'react-hot-toast'

interface DeliveryHandoverOtpCardProps {
  orderId: string
  orderNumber: string
  orderStatus: string
  initialOtp?: string | null
  deliveredAt?: string | null
  deliveryPartnerName?: string | null
}

export const DeliveryHandoverOtpCard: React.FC<DeliveryHandoverOtpCardProps> = ({
  orderId,
  orderNumber,
  orderStatus,
  initialOtp,
  deliveredAt,
  deliveryPartnerName,
}) => {
  const [otpData, setOtpData] = useState<DeliveryOtpResponse | null>(
    initialOtp
      ? {
          orderId,
          orderNumber,
          deliveryOtp: initialOtp,
          expired: false,
          used: false,
          attempts: 0,
          maxAttempts: 5,
          message: 'Share this OTP with the delivery partner upon handover.',
        }
      : null
  )
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const fetchOtp = async () => {
    if (orderStatus !== 'OUT_FOR_DELIVERY') return
    setLoading(true)
    try {
      const data = await customerService.getDeliveryOtp(orderId)
      setOtpData(data)
    } catch {
      // Handled quietly or fallback to initialOtp
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderStatus === 'OUT_FOR_DELIVERY') {
      fetchOtp()
    }
  }, [orderId, orderStatus])

  const handleCopyOtp = () => {
    const code = otpData?.deliveryOtp || initialOtp
    if (!code) return

    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('OTP copied to clipboard')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleRegenerateOtp = async () => {
    setRegenerating(true)
    try {
      const res = await customerService.regenerateDeliveryOtp(orderId)
      setOtpData(res)
      toast.success('New Delivery OTP generated successfully!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to regenerate OTP'
      toast.error(msg)
    } finally {
      setRegenerating(false)
    }
  }

  // 1. Order is DELIVERED
  if (orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED') {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 sm:p-5 text-emerald-950 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-emerald-900 text-sm">Delivered ✓</h4>
            <span className="text-[10px] uppercase font-bold bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full">
              Verified Handover
            </span>
          </div>
          <p className="text-xs text-emerald-800 mt-0.5">
            Delivered successfully{deliveryPartnerName ? ` by ${deliveryPartnerName}` : ''}{' '}
            {deliveredAt ? `on ${new Date(deliveredAt).toLocaleString('en-IN')}` : ''}.
          </p>
        </div>
      </div>
    )
  }

  // 2. Order is NOT YET OUT_FOR_DELIVERY
  if (orderStatus !== 'OUT_FOR_DELIVERY') {
    return (
      <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-3.5 text-xs text-stone-600 flex items-center gap-2.5">
        <Truck className="w-4 h-4 text-stone-400 shrink-0" />
        <span>Delivery OTP will be available when your order is out for delivery.</span>
      </div>
    )
  }

  // 3. Order is OUT_FOR_DELIVERY
  const displayOtp = otpData?.deliveryOtp || initialOtp
  const isExpired = otpData?.expired === true

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 text-white p-5 sm:p-6 border border-amber-800/80 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 shrink-0">
            <Truck className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40">
                Out for Delivery
              </span>
              {deliveryPartnerName && (
                <span className="text-xs text-amber-200/90 font-medium">
                  • Courier: <strong>{deliveryPartnerName}</strong>
                </span>
              )}
            </div>
            <h3 className="text-base font-serif font-bold text-white mt-0.5">
              🚚 Your Order is Out for Delivery
            </h3>
          </div>
        </div>

        <p className="text-xs text-amber-200/80 sm:text-right">
          Delivery Partner is on the way.
        </p>
      </div>

      {/* OTP Display Box */}
      {isExpired ? (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-red-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Delivery OTP has expired. Please request a new OTP.</span>
          </div>
          <button
            type="button"
            onClick={handleRegenerateOtp}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Generating...' : 'Regenerate Delivery OTP'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white/10 rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-200 font-bold uppercase tracking-wider">
              <span>🔐 Delivery Handover OTP</span>
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-amber-300 tracking-[0.25em] mt-1 drop-shadow-sm select-all">
              {displayOtp ? displayOtp : loading ? '••• •••' : '------'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {displayOtp && (
              <button
                type="button"
                onClick={handleCopyOtp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold border border-white/30 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">OTP Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-200" />
                    <span>Copy OTP</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleRegenerateOtp}
              disabled={regenerating}
              title="Regenerate OTP"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 border border-white/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Security Guidance Text */}
      <div className="text-xs text-amber-100/90 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 space-y-1">
        <p className="font-semibold text-amber-200">
          Share this OTP with the delivery partner only when your order is being handed over.
        </p>
        <p className="text-[11px] text-amber-200/70">
          This OTP is required to complete delivery.
        </p>
      </div>
    </div>
  )
}
