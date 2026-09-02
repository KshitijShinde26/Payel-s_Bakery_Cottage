import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '../schemas'

describe('Auth Validation Schemas', () => {
  describe('Login Validation', () => {
    it('should validate valid credentials with Customer role', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
      expect(result.success).toBe(true)
    })

    it('should validate valid credentials with Shopkeeper role', () => {
      const result = loginSchema.safeParse({
        email: 'shop@example.com',
        password: 'Password123!',
        role: 'SHOPKEEPER',
      })
      expect(result.success).toBe(true)
    })

    it('should validate valid credentials with Admin role', () => {
      const result = loginSchema.safeParse({
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalidemail',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address')
      }
    })

    it('should reject missing role', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123!',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Registration Validation', () => {
    it('should validate valid customer registration', () => {
      const result = registerSchema.safeParse({
        role: 'CUSTOMER',
        fullName: 'Payal Shinde',
        email: 'payal@example.com',
        phoneNumber: '9876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      expect(result.success).toBe(true)
    })

    it('should reject weak passwords', () => {
      const result = registerSchema.safeParse({
        role: 'CUSTOMER',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        password: '123', // Too short, no uppercase, no symbols
        confirmPassword: '123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        role: 'CUSTOMER',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })

    it('should reject invalid phone numbers', () => {
      const result = registerSchema.safeParse({
        role: 'CUSTOMER',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '12345', // Too short
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      expect(result.success).toBe(false)
    })
  })
})

