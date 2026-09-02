import { apiClient } from '@/lib/apiClient'
import type { CustomCakePayload, CustomCakeRequest } from '../types'

const CUSTOM_CAKE_STORAGE_PREFIX = 'payals_bakery_custom_cakes_'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const customCakeService = {
  validateReferenceImage(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'Please upload a reference image for your cake design.' }
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { isValid: false, error: 'Image size exceeds maximum limit of 5 MB. Please select a smaller photo.' }
    }

    const fileNameLower = file.name.toLowerCase()
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext))
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())

    if (!hasValidExtension || !hasValidMime) {
      return { isValid: false, error: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.' }
    }

    return { isValid: true }
  },

  async submitRequest(payload: CustomCakePayload, userId?: string): Promise<CustomCakeRequest> {
    const validation = this.validateReferenceImage(payload.referenceImage)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid reference image.')
    }

    // Convert file to Base64/data URL for preview & offline session persistence
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read reference image file.'))
      reader.readAsDataURL(payload.referenceImage)
    })

    const formData = new FormData()
    formData.append('cakeType', payload.cakeType)
    formData.append('flavor', payload.flavor)
    formData.append('weight', payload.weight)
    formData.append('dietaryPreference', payload.dietaryPreference)
    if (payload.customMessage) formData.append('customMessage', payload.customMessage)
    if (payload.specialInstructions) formData.append('specialInstructions', payload.specialInstructions)
    formData.append('referenceImage', payload.referenceImage)
    formData.append('preferredDeliveryDate', payload.preferredDeliveryDate)
    formData.append('preferredDeliveryTime', payload.preferredDeliveryTime)

    try {
      // Try backend Custom Cake API
      const response = await apiClient.post<CustomCakeRequest>('/custom-cakes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch {
      // Session persistence during phase integration
      const newRequest: CustomCakeRequest = {
        id: `custom-cake-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: userId || 'guest',
        cakeType: payload.cakeType,
        flavor: payload.flavor,
        weight: payload.weight,
        dietaryPreference: payload.dietaryPreference,
        customMessage: payload.customMessage,
        specialInstructions: payload.specialInstructions,
        referenceImageUrl: imageUrl,
        referenceImageName: payload.referenceImage.name,
        referenceImageSize: payload.referenceImage.size,
        preferredDeliveryDate: payload.preferredDeliveryDate,
        preferredDeliveryTime: payload.preferredDeliveryTime,
        status: 'PENDING_REVIEW',
        estimatedPrice: 850,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (userId) {
        const existing = await this.getMyRequests(userId)
        const updated = [newRequest, ...existing]
        localStorage.setItem(`${CUSTOM_CAKE_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }

      return newRequest
    }
  },

  async getMyRequests(userId?: string): Promise<CustomCakeRequest[]> {
    try {
      const response = await apiClient.get<CustomCakeRequest[]>('/custom-cakes/my-requests')
      return response.data
    } catch {
      if (userId) {
        const local = localStorage.getItem(`${CUSTOM_CAKE_STORAGE_PREFIX}${userId}`)
        if (local) {
          try {
            return JSON.parse(local)
          } catch {
            return []
          }
        }
      }
      return []
    }
  },

  async getRequestById(id: string, userId?: string): Promise<CustomCakeRequest | null> {
    try {
      const response = await apiClient.get<CustomCakeRequest>(`/custom-cakes/${id}`)
      return response.data
    } catch {
      if (userId) {
        const list = await this.getMyRequests(userId)
        return list.find((r) => r.id === id) || null
      }
      return null
    }
  },
}
