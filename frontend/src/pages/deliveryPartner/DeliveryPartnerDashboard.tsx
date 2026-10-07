import React, { useState, useEffect } from 'react'
import {
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Navigation,
  KeyRound,
  User,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react'
import { deliveryPartnerService } from '@/features/deliveryPartner/services/deliveryPartnerService'
import type {
  DeliveryPartnerSummary,
  DeliveryOrder,
  UpdateDeliveryPartnerPayload,
} from '@/features/deliveryPartner/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import toast from 'react-hot-toast'

export const DeliveryPartnerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'deliveries' | 'profile'>('deliveries')
  const [summary, setSummary] = useState<DeliveryPartnerSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Modals
  const [otpModalOrder, setOtpModalOrder] = useState<DeliveryOrder | null>(null)
  const [otpInput, setOtpInput] = useState<string>('')
  const [submittingOtp, setSubmittingOtp] = useState<boolean>(false)

  const [failModalOrder, setFailModalOrder] = useState<DeliveryOrder | null>(null)
  const [failReason, setFailReason] = useState<string>('Customer unavailable')
  const [failNotes, setFailNotes] = useState<string>('')
  const [submittingFail, setSubmittingFail] = useState<boolean>(false)

  // Profile forms
  const [profileForm, setProfileForm] = useState<UpdateDeliveryPartnerPayload>({
    serviceArea: '',
    vehicleType: '',
    vehicleNumber: '',
    emergencyContact: '',
  })
  const [updatingProfile, setUpdatingProfile] = useState<boolean>(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false)

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const data = await deliveryPartnerService.getDashboardSummary()
      setSummary(data)
      if (data.partnerProfile) {
        setProfileForm({
          serviceArea: data.partnerProfile.serviceArea || '',
          vehicleType: data.partnerProfile.vehicleType || '',
          vehicleNumber: data.partnerProfile.vehicleNumber || '',
          emergencyContact: data.partnerProfile.emergencyContact || '',
        })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load delivery dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleStartDelivery = async (order: DeliveryOrder) => {
    try {
      await deliveryPartnerService.startDelivery(order.id)
      toast.success(`Delivery started for Order #${order.orderNumber}! Customer OTP generated.`)
      fetchDashboardData(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start delivery.')
    }
  }

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpModalOrder) return
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP provided by the customer.')
      return
    }

    try {
      setSubmittingOtp(true)
      await deliveryPartnerService.confirmDelivery(otpModalOrder.id, { otp: otpInput.trim() })
      toast.success(`Order #${otpModalOrder.orderNumber} successfully delivered!`)
      setOtpModalOrder(null)
      setOtpInput('')
      fetchDashboardData(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid delivery OTP code.')
    } finally {
      setSubmittingOtp(false)
    }
  }

  const handleReportFailure = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!failModalOrder) return

    try {
      setSubmittingFail(true)
      await deliveryPartnerService.reportDeliveryFailure(failModalOrder.id, {
        reason: failReason,
        notes: failNotes,
      })
      toast.success(`Issue recorded for Order #${failModalOrder.orderNumber}.`)
      setFailModalOrder(null)
      setFailReason('Customer unavailable')
      setFailNotes('')
      fetchDashboardData(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to report delivery issue.')
    } finally {
      setSubmittingFail(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUpdatingProfile(true)
      const updated = await deliveryPartnerService.updateProfile(profileForm)
      toast.success('Profile details updated successfully!')
      if (summary) {
        setSummary({ ...summary, partnerProfile: updated })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    try {
      setUpdatingPassword(true)
      await deliveryPartnerService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const getGoogleMapsUrl = (address: any) => {
    if (!address) return '#'
    const query = [
      address.addressLine,
      address.areaLocality,
      address.city,
      address.pincode,
    ].filter(Boolean).join(', ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" />
            <span>Delivery Fleet Dashboard</span>
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Welcome back, <span className="font-semibold text-stone-800">{user?.fullName || 'Partner'}</span> • Service Zone: <span className="font-medium text-amber-700">{summary?.partnerProfile?.serviceArea || 'General'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deliveries'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Deliveries
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Profile & Vehicle
          </button>
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
            title="Refresh Deliveries"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Assigned</p>
            <p className="text-xl font-bold text-stone-900">{summary?.assignedDeliveries ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pickups Pending</p>
            <p className="text-xl font-bold text-stone-900">{summary?.pickupsPending ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Out for Delivery</p>
            <p className="text-xl font-bold text-stone-900">{summary?.outForDelivery ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Delivered Today</p>
            <p className="text-xl font-bold text-stone-900">{summary?.deliveredToday ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Failed / Issues</p>
            <p className="text-xl font-bold text-stone-900">{summary?.failedDeliveries ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>Assigned Deliveries</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {summary?.todayOrders?.length || 0} Orders
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-500">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
              <p className="text-sm font-semibold">Loading assigned deliveries from bakery server...</p>
            </div>
          ) : !summary?.todayOrders || summary.todayOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-300 text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">No deliveries assigned yet</h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Orders assigned to you by bakery dispatch will appear here automatically with customer delivery instructions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.todayOrders.map((order) => {
                const isDelivered = order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED'
                const isOut = order.orderStatus === 'OUT_FOR_DELIVERY'
                const isFailed = order.orderStatus === 'DELIVERY_FAILED'
                const isReadyForPickup = order.orderStatus === 'READY' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PREPARING'

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                      isOut
                        ? 'border-purple-300 ring-2 ring-purple-100'
                        : isDelivered
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : isFailed
                        ? 'border-red-200 bg-red-50/10'
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOut
                                ? 'bg-purple-100 text-purple-800 animate-pulse'
                                : isFailed
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} • {order.items?.length || 0} items
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-stone-900">
                          ₹{Number(order.grandTotal).toFixed(2)}
                        </span>
                        <span
                          className={`block text-[10px] font-semibold ${
                            order.paymentStatus === 'PAID'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD (Cash/UPI on delivery)' : `Paid (${order.paymentMethod})`}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="space-y-2.5 text-xs text-stone-700">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900 text-sm">{order.customerName}</span>
                        {order.customerPhone && (
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-colors border border-amber-200"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-600" />
                            <span>Call Customer</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-stone-800 font-medium">
                            {order.deliveryAddress?.addressLine}
                            {order.deliveryAddress?.areaLocality ? `, ${order.deliveryAddress.areaLocality}` : ''}
                          </p>
                          <p className="text-stone-500 text-[11px]">
                            {order.deliveryAddress?.city} • PIN: {order.deliveryAddress?.pincode}
                            {order.deliveryAddress?.landmark ? ` (Near: ${order.deliveryAddress.landmark})` : ''}
                          </p>
                        </div>
                        <a
                          href={getGoogleMapsUrl(order.deliveryAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 hover:text-amber-700 transition-all shrink-0"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-600" />
                          <span>Maps</span>
                        </a>
                      </div>

                      {order.preferredDeliveryTime && (
                        <div className="text-[11px] text-amber-800 font-medium">
                          🕒 Preferred Slot: {order.preferredDeliveryDate} ({order.preferredDeliveryTime})
                        </div>
                      )}

                      {/* Items preview */}
                      <div className="pt-1 border-t border-stone-100">
                        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Package Contents:</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-[11px] text-stone-600">
                              <span>
                                {item.quantity}x {item.productName} {item.weightOption ? `(${item.weightOption})` : ''}
                              </span>
                              <span className="font-mono">₹{Number(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Failure reason if applicable */}
                      {isFailed && (
                        <div className="p-2.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs">
                          <p className="font-bold">Delivery Issue Reported:</p>
                          <p>{order.deliveryFailureReason || 'Not specified'}</p>
                          {order.deliveryNotes && <p className="text-[11px] text-red-600 mt-0.5">{order.deliveryNotes}</p>}
                        </div>
                      )}

                      {/* Delivered timestamp */}
                      {isDelivered && (
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivered successfully {order.deliveredAt ? `at ${new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                      {isReadyForPickup && (
                        <button
                          type="button"
                          onClick={() => handleStartDelivery(order)}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Start Delivery (Out for Delivery)</span>
                        </button>
                      )}

                      {isOut && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpModalOrder(order)
                              setOtpInput('')
                            }}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>Confirm Delivery (Enter OTP)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFailModalOrder(order)
                              setFailReason('Customer unavailable')
                              setFailNotes('')
                            }}
                            className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 font-bold text-xs transition-all"
                            title="Report Delivery Issue"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {isDelivered && (
                        <div className="w-full text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                          Completed Handover
                        </div>
                      )}

                      {isFailed && (
                        <button
                          type="button"
                          onClick={() => handleStartDelivery(order)}
                          className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all"
                        >
                          Retry Delivery Run
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Profile & Vehicle Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operational Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                <span>Delivery Fleet Profile</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage your vehicle information, coverage zone, and emergency details.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || ''}
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Login Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assigned Service Zone / Area</label>
                <input
                  type="text"
                  value={profileForm.serviceArea}
                  onChange={(e) => setProfileForm({ ...profileForm, serviceArea: e.target.value })}
                  placeholder="e.g. South Mumbai / Bandra West"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    value={profileForm.vehicleType}
                    onChange={(e) => setProfileForm({ ...profileForm, vehicleType: e.target.value })}
                    placeholder="e.g. Motorcycle, Scooter, Van"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Vehicle Reg Number</label>
                  <input
                    type="text"
                    value={profileForm.vehicleNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, vehicleNumber: e.target.value })}
                    placeholder="e.g. MH-01-AB-1234"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={profileForm.emergencyContact}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {updatingProfile ? 'Saving Changes...' : 'Save Fleet Details'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>Security & Password</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Update your account password for enhanced security.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new strong password"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus-ring font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {updatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Delivery Verification Modal */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <span>Verify Delivery Handover</span>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-600">
              <p>
                Ask customer <span className="font-bold text-stone-900">{otpModalOrder.customerName}</span> for the 6-digit Delivery OTP shown on their order tracking screen.
              </p>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 rounded-2xl border-2 border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 text-stone-900"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOtp || otpInput.length !== 6}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {submittingOtp ? 'Verifying...' : 'Complete Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue / Delivery Failure Modal */}
      {failModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Report Delivery Issue</span>
              </div>
              <button
                type="button"
                onClick={() => setFailModalOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Reporting an issue for Order <span className="font-mono font-bold text-stone-900">#{failModalOrder.orderNumber}</span> will alert bakery dispatch for resolution.
            </p>

            <form onSubmit={handleReportFailure} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason for Delivery Issue *</label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 font-medium focus-ring"
                  required
                >
                  <option value="Customer unavailable">Customer unavailable / Not answering phone</option>
                  <option value="Incorrect address">Incorrect or unlocatable delivery address</option>
                  <option value="Customer requested reschedule">Customer requested delivery reschedule</option>
                  <option value="Delivery partner unable to deliver">Vehicle breakdown / Unable to reach</option>
                  <option value="Customer refused delivery">Customer refused delivery</option>
                  <option value="Other">Other operational issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Additional Operational Notes</label>
                <textarea
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                  placeholder="Provide context for dispatch team..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus-ring resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFail}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {submittingFail ? 'Submitting...' : 'Submit Issue Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default DeliveryPartnerDashboard
