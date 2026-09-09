import { describe, it, expect, vi } from 'vitest'
import { customCakeService } from '../services/customCakeService'
import { apiClient } from '@/lib/apiClient'
import type { CustomCakePayload } from '../types'

describe('Custom Cake Service & Image Validation', () => {
  it('should validate and accept a valid JPG image under 5 MB', () => {
    const validFile = new File(['sample image content'], 'wedding-cake.jpg', {
      type: 'image/jpeg',
    })
    const result = customCakeService.validateReferenceImage(validFile)
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should validate and accept a valid PNG image', () => {
    const validFile = new File(['sample image content'], 'birthday-design.png', {
      type: 'image/png',
    })
    const result = customCakeService.validateReferenceImage(validFile)
    expect(result.isValid).toBe(true)
  })

  it('should validate and accept a valid WEBP image', () => {
    const validFile = new File(['sample image content'], 'theme-cake.webp', {
      type: 'image/webp',
    })
    const result = customCakeService.validateReferenceImage(validFile)
    expect(result.isValid).toBe(true)
  })

  it('should reject non-image file formats (e.g. PDF)', () => {
    const pdfFile = new File(['sample document content'], 'cake-recipe.pdf', {
      type: 'application/pdf',
    })
    const result = customCakeService.validateReferenceImage(pdfFile)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Invalid file format')
  })

  it('should reject images larger than 5 MB', () => {
    const largeContent = new Uint8Array(6 * 1024 * 1024) // 6 MB
    const largeFile = new File([largeContent], 'huge-design.jpg', {
      type: 'image/jpeg',
    })
    const result = customCakeService.validateReferenceImage(largeFile)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('5 MB')
  })

  it('should create and store custom cake request with PENDING_REVIEW status', async () => {
    const validFile = new File(['cake image bytes'], 'custom-anniversary.jpg', {
      type: 'image/jpeg',
    })

    const payload: CustomCakePayload = {
      cakeType: 'Anniversary Cake',
      flavor: 'Red Velvet',
      weight: '2.0 kg',
      dietaryPreference: 'Eggless',
      customMessage: 'Happy 25th Anniversary!',
      specialInstructions: 'Golden pearl border',
      referenceImage: validFile,
      preferredDeliveryDate: '2026-08-25',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
    }

    const mockResponse = {
      id: 'cake-req-123',
      cakeType: 'Anniversary Cake',
      flavor: 'Red Velvet',
      weight: '2.0 kg',
      dietaryPreference: 'Eggless',
      customMessage: 'Happy 25th Anniversary!',
      specialInstructions: 'Golden pearl border',
      referenceImageUrl: 'https://example.com/cake.jpg',
      preferredDeliveryDate: '2026-08-25',
      preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
      status: 'PENDING_REVIEW',
      createdAt: '2026-08-01T10:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse } as any)

    const created = await customCakeService.submitRequest(payload, 'test-customer-123')
    expect(created.id).toBe('cake-req-123')
    expect(created.cakeType).toBe('Anniversary Cake')
    expect(created.flavor).toBe('Red Velvet')
    expect(created.weight).toBe('2.0 kg')
    expect(created.status).toBe('PENDING_REVIEW')
    expect(created.customMessage).toBe('Happy 25th Anniversary!')
  })
})
