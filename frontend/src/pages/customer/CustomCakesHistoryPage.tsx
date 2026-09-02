import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { customCakeService } from '@/features/customCake/services/customCakeService'
import type { CustomCakeRequest, CustomCakeStatus } from '@/features/customCake/types'
import { Button } from '@/components/ui/Button'
import {
  Wand2,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'


const getStatusBadge = (status: CustomCakeStatus) => {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved by Bakery',
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      }
    case 'UNDER_REVIEW':
      return {
        label: 'Kitchen Reviewing',
        icon: Sparkles,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      }
    case 'CHANGES_REQUESTED':
      return {
        label: 'Changes Suggested',
        icon: AlertTriangle,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
      }
    case 'REJECTED':
      return {
        label: 'Declined',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
      }
    case 'CONVERTED_TO_ORDER':
      return {
        label: 'Order In Production',
        icon: CheckCircle2,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      }
    case 'PENDING_REVIEW':
    default:
      return {
        label: 'Pending Bakery Review',
        icon: Clock,
        className: 'bg-stone-100 text-stone-700 border-stone-200',
      }
  }
}

export const CustomCakesHistoryPage: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<CustomCakeRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    document.title = "My Custom Cake Requests | Payal's Bakery Cottage"
    const loadRequests = async () => {
      setLoading(true)
      try {
        const list = await customCakeService.getMyRequests(user?.id)
        setRequests(list)
      } catch (err) {
        console.error('Failed to load custom cake requests', err)
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
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
          <span className="font-semibold text-stone-800">My Custom Cake Requests</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
              Artisan Design Requests
            </span>
            <h1 className="text-3xl font-bold font-serif text-stone-900">
              My Custom Cake Requests ({requests.length})
            </h1>
          </div>
          <Link to="/customer/customize-cake">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs">
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              Design New Cake
            </Button>
          </Link>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-amber-100 p-6" />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-6">
            {requests.map((req) => {
              const badge = getStatusBadge(req.status)
              const BadgeIcon = badge.icon

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border border-amber-100/80 shadow-xs flex flex-col md:flex-row gap-6 items-start justify-between"
                >
                  {/* Reference Image Thumbnail */}
                  <div className="w-full md:w-44 aspect-square rounded-2xl overflow-hidden bg-amber-50 shrink-0 border border-amber-100">
                    <img
                      src={req.referenceImageUrl}
                      alt={`Reference design for ${req.cakeType}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.className}">
                        <BadgeIcon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                      <span className="text-xs text-stone-400">
                        Submitted on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold font-serif text-stone-900">
                      {req.cakeType} — {req.flavor}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-stone-600 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Weight:</span>
                        <strong>{req.weight}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Dietary:</span>
                        <strong>{req.dietaryPreference}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Estimated Price:</span>
                        <strong>₹{req.confirmedPrice || req.estimatedPrice || 'Pending Review'}</strong>
                      </div>
                    </div>

                    {req.customMessage && (
                      <p className="text-xs text-stone-700">
                        <strong className="text-stone-900">Message on Cake:</strong> "{req.customMessage}"
                      </p>
                    )}

                    {req.specialInstructions && (
                      <p className="text-xs text-stone-500 line-clamp-2">
                        <strong className="text-stone-700">Instructions:</strong> {req.specialInstructions}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Requested Date: <strong>{req.preferredDeliveryDate}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Slot: <strong>{req.preferredDeliveryTime}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-amber-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-4">
              <Wand2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-stone-900">
              No Custom Cake Requests Yet
            </h3>
            <p className="mt-2 text-xs text-stone-500 max-w-sm">
              Have a dream cake in mind for an upcoming celebration? Share your photo inspiration and let our chef review your design.
            </p>
            <Link to="/customer/customize-cake" className="mt-6">
              <Button variant="primary" size="sm" className="bg-amber-600 text-white rounded-xl">
                Design Your Cake Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
export default CustomCakesHistoryPage
