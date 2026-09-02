import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { type RoleType } from '@/features/auth/types'
import toast from 'react-hot-toast'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Verifying session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />
  }

  return <>{children}</>
}

export const RoleProtectedRoute: React.FC<{
  children: React.ReactNode
  allowedRoles: (RoleType | string)[]
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Verifying access permissions..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />
  }

  const userRole = user?.role ? String(user.role).toUpperCase() : ''
  const isAllowed = allowedRoles.some((role) => String(role).toUpperCase() === userRole)

  if (!isAllowed) {
    toast.error('Access denied: You do not have permission to access this page.')

    // Direct redirection strictly according to the actual authenticated role
    switch (userRole) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />
      case 'SHOPKEEPER':
        return <Navigate to="/shopkeeper/dashboard" replace />
      case 'CUSTOMER':
        return <Navigate to="/customer/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Loading..." />
  }

  if (isAuthenticated && user) {
    const from = (location.state as any)?.from?.pathname

    if (from && !from.startsWith('/login') && !from.startsWith('/register') && from !== '/') {
      if (user.role === 'ADMIN' && from.startsWith('/admin')) {
        return <Navigate to={from} replace />
      }
      if (user.role === 'SHOPKEEPER' && from.startsWith('/shopkeeper')) {
        return <Navigate to={from} replace />
      }
      if (user.role === 'CUSTOMER' && !from.startsWith('/admin') && !from.startsWith('/shopkeeper')) {
        return <Navigate to={from} replace />
      }
    }

    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />
      case 'SHOPKEEPER':
        return <Navigate to="/shopkeeper/dashboard" replace />
      case 'CUSTOMER':
        return <Navigate to="/customer/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}
