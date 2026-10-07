import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react'
import { authService } from '../services/authService'
import { setClientAccessToken } from '@/lib/apiClient'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '../types'
import toast from 'react-hot-toast'
import axios from 'axios'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  verifyOtp: (email: string, code: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  resendOtp: (email: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize auth state: Check for active session / refresh cookie on mount
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api'
        const response = await axios.post<{ accessToken: string }>(
          `${baseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const token = response.data.accessToken
        setClientAccessToken(token)

        const currentUser = await authService.getCurrentUser()
        if (isMounted) {
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      } catch {
        // No active session or refresh cookie expired
        if (isMounted) {
          setClientAccessToken(null)
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Listen for background token updates and session expirations from Axios interceptors
  useEffect(() => {
    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<{ accessToken: string }>
      setClientAccessToken(customEvent.detail.accessToken)
    }

    const handleSessionExpired = () => {
      setUser((currentUser) => {
        if (currentUser) {
          toast.error('Session expired. Please log in again to continue.')
        }
        return null
      })
      setIsAuthenticated(false)
      setClientAccessToken(null)
    }

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed)
    window.addEventListener('auth:session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed)
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [])

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true)
    try {
      const data = await authService.login(payload)
      setClientAccessToken(data.accessToken)
      setUser(data.user)
      setIsAuthenticated(true)
      toast.success(`Welcome back, ${data.user.fullName}!`)
      return data.user
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      const response = await authService.register(payload)
      toast.success(response.message || 'Account registration initiated! Please enter the OTP sent to your email.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please check your details.'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true)
    try {
      const response = await authService.verifyOtp({ email, code })
      toast.success(response.message || 'Email verified successfully! You can now log in.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verification failed. Invalid or expired OTP.'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = useCallback(async (email: string, code: string) => {
    return verifyOtp(email, code)
  }, [])

  const resendOtp = async (email: string) => {
    try {
      const response = await authService.resendOtp(email)
      toast.success(response.message || 'A new verification OTP has been sent to your email.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP. Please try again later.'
      toast.error(message)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(email)
      toast.success(response.message || 'Password reset OTP sent to your email.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send password reset code.'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (payload: ResetPasswordPayload) => {
    setIsLoading(true)
    try {
      const response = await authService.resetPassword(payload)
      toast.success(response.message || 'Password reset successfully! Please sign in.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password. Invalid or expired OTP.'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
    } catch {
      // Backend logout failed, still purge local client state
    } finally {
      setClientAccessToken(null)
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Successfully logged out.')
      setIsLoading(false)
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyEmail,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        updateUser,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
