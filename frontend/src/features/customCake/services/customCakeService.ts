import { apiClient } from '@/lib/apiClient'
import type { CustomCakePayload, CustomCakeRequest } from '../types'

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

  async submitRequest(payload: CustomCakePayload, _userId?: string): Promise<CustomCakeRequest> {
    const validation = this.validateReferenceImage(payload.referenceImage)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid reference image.')
    }

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

    const response = await apiClient.post<CustomCakeRequest>('/custom-cakes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getMyRequests(_userId?: string): Promise<CustomCakeRequest[]> {
    try {
      const response = await apiClient.get<CustomCakeRequest[]>('/custom-cakes/my-requests')
      if (Array.isArray(response.data)) {
        return response.data
      }
      return []
    } catch (error) {
      console.warn('Failed to fetch custom cake requests from backend API:', error)
      return []
    }
  },

  async getRequestById(id: string, _userId?: string): Promise<CustomCakeRequest | null> {
    try {
      const response = await apiClient.get<CustomCakeRequest>(`/custom-cakes/${id}`)
      if (response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.warn(`Failed to fetch custom cake request #${id} from backend API:`, error)
      return null
    }
  },
}

