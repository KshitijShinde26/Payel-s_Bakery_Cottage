import React from 'react'
import { Link } from 'react-router-dom'
import {
  Wand2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import type { CustomCakeRequest, CustomCakeStatus } from '@/features/customCake/types'

interface CustomerCustomCakesPreviewProps {
  requests: CustomCakeRequest[]
}

const getCakeStatusBadge = (status: CustomCakeStatus) => {
  switch (status) {
    case 'APPROVED':
      return { label: 'Quote Approved', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
    case 'UNDER_REVIEW':
      return { label: 'Chef Reviewing', icon: Sparkles, className: 'bg-amber-50 text-amber-800 border-amber-200' }
    case 'CHANGES_REQUESTED':
      return { label: 'Changes Suggested', icon: AlertTriangle, className: 'bg-orange-50 text-orange-800 border-orange-200' }
    case 'REJECTED':
      return { label: 'Declined', icon: XCircle, className: 'bg-red-50 text-red-800 border-red-200' }
    case 'CONVERTED_TO_ORDER':
      return { label: 'In Production', icon: CheckCircle2, className: 'bg-blue-50 text-blue-800 border-blue-200' }
    case 'PENDING_REVIEW':
    default:
      return { label: 'Pending Review', icon: Clock, className: 'bg-stone-100 text-stone-700 border-stone-200' }
  }
}

export const CustomerCustomCakesPreview: React.FC<CustomerCustomCakesPreviewProps> = ({ requests }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Artisan Studio
          </span>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            Custom Cake Inquiries
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/customer/custom-cakes"
            className="text-xs font-semibold text-stone-600 hover:text-amber-800 transition-colors"
          >
            View All ({requests.length})
          </Link>
          <Link
            to="/customer/customize-cake"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Design Cake</span>
          </Link>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requests.slice(0, 4).map((cake) => {
            const badge = getCakeStatusBadge(cake.status)
            const BadgeIcon = badge.icon

            return (
              <div
                key={cake.id}
                className="p-4 rounded-3xl bg-amber-50/30 border border-amber-100/80 hover:border-amber-200 transition-all flex gap-3.5 items-start"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-amber-100 shrink-0">
                  <img
                    src={cake.referenceImageUrl}
                    alt={cake.cakeType}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                      <BadgeIcon className="w-2.5 h-2.5" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {cake.weight}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-stone-900 text-sm truncate">
                    {cake.cakeType}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    Flavor: {cake.flavor} • {cake.dietaryPreference}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-stone-600">
                    <span className="flex items-center gap-1 text-stone-500">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      {cake.preferredDeliveryDate}
                    </span>
                    <strong className="text-amber-900 font-serif">
                      ₹{cake.confirmedPrice || cake.estimatedPrice || 'TBD'}
                    </strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Real Empty State */
        <div className="p-8 text-center bg-stone-50/50 rounded-3xl border border-dashed border-stone-200 space-y-2">
          <Wand2 className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="text-sm font-semibold text-stone-800">No custom cake requests yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Have a dream cake design in mind for a birthday or anniversary? Upload your reference photo for our head chef to review.
          </p>
          <div className="pt-2">
            <Link
              to="/customer/customize-cake"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Submit Design Request</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
