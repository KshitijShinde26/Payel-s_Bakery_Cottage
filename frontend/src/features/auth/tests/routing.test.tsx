import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, RoleProtectedRoute } from '@/routes/guards'
import { useAuth } from '../hooks/useAuth'

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute Guard', () => {
  it('should redirect to /login if unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { queryByTestId, getByTestId } = render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Profile Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(getByTestId('login-page')).toBeInTheDocument()
  })

  it('should render children if authenticated and email verified', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        role: 'CUSTOMER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Profile Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(getByTestId('protected-content')).toBeInTheDocument()
  })
})

describe('RoleProtectedRoute Guard', () => {
  it('should allow CUSTOMER to access customer dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        fullName: 'Customer User',
        email: 'cust@example.com',
        phoneNumber: '9876543210',
        role: 'CUSTOMER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/customer/dashboard']}>
        <Routes>
          <Route
            path="/customer/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
                <div data-testid="customer-dashboard">Customer Dashboard</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(getByTestId('customer-dashboard')).toBeInTheDocument()
  })

  it('should deny CUSTOMER access to admin dashboard and redirect to customer dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        fullName: 'Customer User',
        email: 'cust@example.com',
        phoneNumber: '9876543210',
        role: 'CUSTOMER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { queryByTestId, getByTestId } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <div data-testid="admin-dashboard">Admin Dashboard</div>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={<div data-testid="customer-dashboard">Customer Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    )

    expect(queryByTestId('admin-dashboard')).not.toBeInTheDocument()
    expect(getByTestId('customer-dashboard')).toBeInTheDocument()
  })

  it('should deny SHOPKEEPER access to admin dashboard and redirect to shopkeeper dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '2',
        fullName: 'Shopkeeper User',
        email: 'shop@example.com',
        phoneNumber: '9876543210',
        role: 'SHOPKEEPER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { queryByTestId, getByTestId } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <div data-testid="admin-dashboard">Admin Dashboard</div>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/shopkeeper/dashboard"
            element={<div data-testid="shopkeeper-dashboard">Shopkeeper Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    )

    expect(queryByTestId('admin-dashboard')).not.toBeInTheDocument()
    expect(getByTestId('shopkeeper-dashboard')).toBeInTheDocument()
  })

  it('should allow ADMIN to access admin dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '3',
        fullName: 'Admin User',
        email: 'admin@example.com',
        phoneNumber: '9876543210',
        role: 'ADMIN',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <div data-testid="admin-dashboard">Admin Dashboard</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(getByTestId('admin-dashboard')).toBeInTheDocument()
  })

  it('should allow SHOPKEEPER to access shopkeeper dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '2',
        fullName: 'Shopkeeper User',
        email: 'shop@example.com',
        phoneNumber: '9876543210',
        role: 'SHOPKEEPER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/shopkeeper/dashboard']}>
        <Routes>
          <Route
            path="/shopkeeper/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['SHOPKEEPER']}>
                <div data-testid="shopkeeper-dashboard">Shopkeeper Dashboard</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(getByTestId('shopkeeper-dashboard')).toBeInTheDocument()
  })

  it('should allow DELIVERY_PARTNER to access delivery partner dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '3',
        fullName: 'Delivery Partner User',
        email: 'driver@example.com',
        phoneNumber: '9876543210',
        role: 'DELIVERY_PARTNER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/delivery-partner/dashboard']}>
        <Routes>
          <Route
            path="/delivery-partner/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['DELIVERY_PARTNER']}>
                <div data-testid="delivery-partner-dashboard">Delivery Partner Dashboard</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(getByTestId('delivery-partner-dashboard')).toBeInTheDocument()
  })

  it('should redirect DELIVERY_PARTNER away from admin dashboard to /delivery-partner/dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '3',
        fullName: 'Delivery Partner User',
        email: 'driver@example.com',
        phoneNumber: '9876543210',
        role: 'DELIVERY_PARTNER',
        emailVerified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyEmail: vi.fn(),
      verifyOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      resendOtp: vi.fn(),
    })

    const { queryByTestId, getByTestId } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <div data-testid="admin-dashboard">Admin Dashboard</div>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/delivery-partner/dashboard"
            element={<div data-testid="delivery-partner-dashboard">Delivery Partner Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    )

    expect(queryByTestId('admin-dashboard')).not.toBeInTheDocument()
    expect(getByTestId('delivery-partner-dashboard')).toBeInTheDocument()
  })
})
