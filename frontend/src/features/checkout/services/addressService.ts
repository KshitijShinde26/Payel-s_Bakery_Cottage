import { apiClient } from '@/lib/apiClient'
import type { DeliveryAddress } from '../types'

const ADDRESS_STORAGE_PREFIX = 'payals_bakery_addresses_'

export const addressService = {
  validateIndianAddress(address: Partial<DeliveryAddress>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    if (!address.fullName || address.fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (at least 2 characters).'
    }

    // Indian 10-digit mobile validation
    const phoneRegex = /^[6-9]\d{9}$/
    const cleanedPhone = (address.phoneNumber || '').replace(/\D/g, '')
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      errors.phoneNumber = 'Enter a valid 10-digit Indian mobile number.'
    }

    if (!address.addressLine || address.addressLine.trim().length < 5) {
      errors.addressLine = 'Street address / House No. is required (at least 5 characters).'
    }

    if (!address.areaLocality || address.areaLocality.trim().length < 2) {
      errors.areaLocality = 'Area / Locality / Landmark is required.'
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.city = 'City is required.'
    }

    if (!address.state || address.state.trim().length < 2) {
      errors.state = 'State is required.'
    }

    // Indian 6-digit PIN code validation
    const pinRegex = /^[1-9][0-9]{5}$/
    if (!address.pincode || !pinRegex.test(address.pincode.trim())) {
      errors.pincode = 'Enter a valid 6-digit Indian Postal PIN code.'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  },

  async getAddresses(userId?: string): Promise<DeliveryAddress[]> {
    try {
      const response = await apiClient.get<DeliveryAddress[]>('/addresses')
      return response.data
    } catch {
      if (userId) {
        const local = localStorage.getItem(`${ADDRESS_STORAGE_PREFIX}${userId}`)
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

  async saveAddress(payload: Omit<DeliveryAddress, 'id'>, userId?: string): Promise<DeliveryAddress> {
    const validation = this.validateIndianAddress(payload)
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0] || 'Invalid address details.')
    }

    try {
      const response = await apiClient.post<DeliveryAddress>('/addresses', payload)
      return response.data
    } catch {
      const newAddress: DeliveryAddress = {
        id: `addr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...payload,
        isDefault: payload.isDefault ?? false,
      }

      if (userId) {
        const existing = await this.getAddresses(userId)
        const updated = payload.isDefault
          ? [newAddress, ...existing.map((a) => ({ ...a, isDefault: false }))]
          : [...existing, newAddress]
        localStorage.setItem(`${ADDRESS_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }

      return newAddress
    }
  },

  async deleteAddress(id: string, userId?: string): Promise<void> {
    try {
      await apiClient.delete(`/addresses/${id}`)
    } catch {
      if (userId) {
        const existing = await this.getAddresses(userId)
        const updated = existing.filter((a) => a.id !== id)
        localStorage.setItem(`${ADDRESS_STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
      }
    }
  },
}
