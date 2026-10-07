import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { customCakeService } from '@/features/customCake/services/customCakeService'
import type {
  CakeCategoryType,
  CakeFlavorType,
  CakeWeightType,
  DietaryPreference,
  DeliveryTimeWindow,
} from '@/features/customCake/types'
import { Button } from '@/components/ui/Button'
import {
  Wand2,
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCw,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react'

import toast from 'react-hot-toast'

const CAKE_CATEGORIES: CakeCategoryType[] = [
  'Birthday Cake',
  'Anniversary Cake',
  'Wedding Cake',
  'Theme Cake',
  'Celebration Cake',
  'Other',
]

const CAKE_FLAVORS: CakeFlavorType[] = [
  'Chocolate Truffle',
  'Dutch Dark Chocolate',
  'Vanilla Bean',
  'Red Velvet',
  'Butterscotch Caramel',
  'Fresh Strawberry',
  'Black Forest',
  'Other / Custom Blend',
]

const CAKE_WEIGHTS: CakeWeightType[] = [
  '0.5 kg',
  '1.0 kg',
  '1.5 kg',
  '2.0 kg',
  '2.5 kg',
  '3.0 kg',
  'Custom / Multi-Tier',
]

const DELIVERY_TIMES: DeliveryTimeWindow[] = [
  'Morning (10:00 AM – 01:00 PM)',
  'Afternoon (01:00 PM – 05:00 PM)',
  'Evening (05:00 PM – 08:00 PM)',
]

export const CustomizeCakePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [cakeType, setCakeType] = useState<CakeCategoryType>('Birthday Cake')
  const [flavor, setFlavor] = useState<CakeFlavorType>('Chocolate Truffle')
  const [weight, setWeight] = useState<CakeWeightType>('1.0 kg')
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('Eggless')
  const [customMessage, setCustomMessage] = useState<string>('')
  const [specialInstructions, setSpecialInstructions] = useState<string>('')
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // Tomorrow as default minimum delivery date (24-hour advance order rule)
  const tomorrowStr = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()

  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState<string>(tomorrowStr)
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState<DeliveryTimeWindow>(
    'Evening (05:00 PM – 08:00 PM)'
  )

  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)

  // Handle image file selection & validation
  const handleFileChange = (file: File | null) => {
    if (!file) return

    const validation = customCakeService.validateReferenceImage(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid image file.')
      return
    }

    setReferenceFile(file)
    const preview = URL.createObjectURL(file)
    setImagePreviewUrl(preview)
    toast.success(`Selected reference image: ${file.name}`)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setReferenceFile(null)
    setImagePreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!referenceFile) {
      toast.error('Please upload a cake design/reference image.')
      return
    }

    if (!preferredDeliveryDate) {
      toast.error('Please select your preferred delivery date.')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmedSubmit = async () => {
    if (!referenceFile) return

    setIsSubmitting(true)
    setShowConfirmModal(false)

    try {
      await customCakeService.submitRequest(
        {
          cakeType,
          flavor,
          weight,
          dietaryPreference,
          customMessage: customMessage.trim() || undefined,
          specialInstructions: specialInstructions.trim() || undefined,
          referenceImage: referenceFile,
          preferredDeliveryDate,
          preferredDeliveryTime,
        },
        user?.id
      )

      toast.success('Your custom cake design request has been submitted!', {
        duration: 5000,
      })
      navigate('/customer/custom-cakes')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit custom cake request.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
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
          <Link to="/customer/dashboard" className="hover:text-amber-800 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-800">Customize Cake</span>
        </nav>

        {/* Header Title Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Artisan Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
              Customize Your Cake
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
              Share your cake idea with us and we'll review your design. Upload your reference inspiration, customize flavors and themes, and our bakery kitchen will craft a sweet masterpiece.
            </p>
          </div>
        </div>

        {/* Policy Advisory Banner */}
        <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200/80 p-4 sm:p-5 flex items-start gap-3.5 text-xs text-stone-700">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block text-stone-900 font-bold mb-0.5">
              Reference Design & Review Policy:
            </strong>
            Uploaded photos serve as visual inspiration. The Payal's Bakery Cottage team reviews each custom design to confirm ingredient availability, decoration complexity, preparation time, and final pricing before confirmation.
          </div>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-100/80 shadow-xs space-y-8">
          {/* 1. Cake Category / Occasion Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-3">
              1. Select Cake Occasion / Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAKE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCakeType(cat)}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                    cakeType === cat
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Flavor Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-3">
              2. Select Cake Flavor <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CAKE_FLAVORS.map((flv) => (
                <button
                  key={flv}
                  type="button"
                  onClick={() => setFlavor(flv)}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                    flavor === flv
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
                  }`}
                >
                  {flv}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Weight / Size & Dietary Preference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weight */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-3">
                3. Desired Weight / Size <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {CAKE_WEIGHTS.map((wt) => (
                  <button
                    key={wt}
                    type="button"
                    onClick={() => setWeight(wt)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      weight === wt
                        ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                        : 'bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-amber-50'
                    }`}
                  >
                    {wt}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-3">
                4. Dietary Preference <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDietaryPreference('Eggless')}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                    dietaryPreference === 'Eggless'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-emerald-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    100% Eggless (Recommended)
                  </span>
                  <span className="text-[10px] opacity-80">Strict Vegetarian Standard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDietaryPreference('With Egg')}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                    dietaryPreference === 'With Egg'
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-amber-50'
                  }`}
                >
                  <span>With Egg Option</span>
                  <span className="text-[10px] opacity-80">Standard Bakery Recipe</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Reference Image Upload (Core Requirement) */}
          <div className="border-t border-stone-100 pt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-1">
              5. Upload Cake Design / Reference Image <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-stone-500 mb-4">
              Upload a clear photo or reference design (from Pinterest, gallery, or screenshot). Supported: JPG, PNG, WEBP (Max 5 MB).
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              id="reference-image-input"
              aria-label="Upload reference cake design"
            />

            {!imagePreviewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-amber-600 bg-amber-50/80 scale-[1.01]'
                    : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 hover:border-amber-300'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900">
                  Click to Browse or Drag & Drop Photo Here
                </h3>
                <p className="mt-1.5 text-xs text-stone-500">
                  Select an image from your device or mobile gallery
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-[11px] font-semibold text-stone-600 shadow-xs">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  JPG, JPEG, PNG, WEBP up to 5 MB
                </span>
              </div>
            ) : (
              /* Image Preview Card */
              <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-white border border-amber-100 shadow-sm shrink-0">
                  <img
                    src={imagePreviewUrl}
                    alt="Uploaded cake design reference preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Ready for Review
                  </div>
                  <h4 className="text-sm font-bold font-serif text-stone-900 truncate max-w-xs sm:max-w-md">
                    {referenceFile?.name}
                  </h4>
                  <p className="text-xs text-stone-500">
                    File Size: {referenceFile ? (referenceFile.size / (1024 * 1024)).toFixed(2) : '0'} MB
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-amber-200 text-xs rounded-xl hover:bg-white"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                      Replace Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="border-red-200 text-red-600 text-xs rounded-xl hover:bg-red-50"
                    >
                      <X className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Custom Message & Special Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  6. Message on Cake (Optional)
                </label>
                <span className="text-[11px] text-stone-400 font-mono">
                  {customMessage.length} / 100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Happy 25th Anniversary Maa & Papa!"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-amber-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  7. Special Instructions & Theme
                </label>
                <span className="text-[11px] text-stone-400 font-mono">
                  {specialInstructions.length} / 300
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="e.g. Please use golden drippings with lavender rosettes and minimal sugar pearls..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-amber-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* 6. Preferred Delivery Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-1.5">
                8. Preferred Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={tomorrowStr}
                  value={preferredDeliveryDate}
                  onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-amber-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <Calendar className="w-4 h-4 text-amber-700 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Custom bakes require minimum 24–48 hours baking lead time.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-1.5">
                9. Preferred Delivery Time Window
              </label>
              <div className="relative">
                <select
                  value={preferredDeliveryTime}
                  onChange={(e) => setPreferredDeliveryTime(e.target.value as DeliveryTimeWindow)}
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-amber-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {DELIVERY_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <Clock className="w-4 h-4 text-amber-700 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Your preferred slot is a request; final time is scheduled by the bakery.
              </p>
            </div>
          </div>

          {/* Pricing Advisory Notice */}
          <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                Estimated Baseline Pricing
              </span>
              <p className="text-xs text-stone-600">
                Starting from <strong>₹850 / kg</strong>. Final quote confirmed after reviewing complexity.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
              No Advance Payment Now
            </span>
          </div>

          {/* Submit Action */}
          <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/customer/custom-cakes" className="text-xs font-semibold text-stone-600 hover:text-amber-800">
              View Previous Requests
            </Link>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Design Request...' : 'Submit Custom Cake Request'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 animate-scaleUp space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  Confirm Custom Cake Request
                </h3>
                <p className="text-xs text-stone-500">Please review your cake specifications</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-700 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
              <div className="flex justify-between">
                <span className="text-stone-500">Occasion / Type:</span>
                <strong>{cakeType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Flavor:</span>
                <strong>{flavor}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Weight & Dietary:</span>
                <strong>{weight} • {dietaryPreference}</strong>
              </div>
              {customMessage && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Message:</span>
                  <strong className="text-amber-900 italic">"{customMessage}"</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Preferred Date:</span>
                <strong>{preferredDeliveryDate} ({preferredDeliveryTime.split(' ')[0]})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Reference File:</span>
                <strong className="truncate max-w-xs">{referenceFile?.name}</strong>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 italic leading-relaxed">
              *By submitting, Payal's Bakery Cottage will review your design and reach out to confirm pricing and schedule.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 rounded-xl"
              >
                Edit Form
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default CustomizeCakePage
