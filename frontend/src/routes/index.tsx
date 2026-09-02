import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { ShopkeeperLayout } from '@/layouts/ShopkeeperLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

import { HomePage } from './HomePage'
import { ProductCatalogPage } from '@/pages/catalog/ProductCatalogPage'
import { ProductDetailsPage } from '@/pages/catalog/ProductDetailsPage'
import { CategoryPage } from '@/pages/catalog/CategoryPage'
import { CartPage } from '@/pages/cart/CartPage'
import { WishlistPage } from '@/pages/wishlist/WishlistPage'
import { CheckoutPage } from '@/pages/checkout/CheckoutPage'
import { CustomizeCakePage } from '@/pages/customer/CustomizeCakePage'
import { CustomCakesHistoryPage } from '@/pages/customer/CustomCakesHistoryPage'
import { CustomerOrdersPage } from '@/pages/customer/CustomerOrdersPage'
import { OrderConfirmationPage } from '@/pages/customer/OrderConfirmationPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'

import { CustomerDashboard } from '@/pages/customer/CustomerDashboard'
import { ShopkeeperDashboard } from '@/pages/shopkeeper/ShopkeeperDashboard'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'

import { NotFoundPage } from './NotFoundPage'
import { PublicRoute, ProtectedRoute, RoleProtectedRoute } from './guards'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/products',
        element: <ProductCatalogPage />,
      },
      {
        path: '/products/:id',
        element: <ProductDetailsPage />,
      },
      {
        path: '/categories/:category',
        element: <CategoryPage />,
      },
      {
        path: '/cart',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <CartPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: '/wishlist',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <WishlistPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: '/checkout',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <CheckoutPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: '/customer/customize-cake',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomizeCakePage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: '/customer/custom-cakes',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomCakesHistoryPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: '/customer/orders',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerOrdersPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: '/customer/orders/:id',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <OrderConfirmationPage />
          </RoleProtectedRoute>
        ),
      },



      {
        path: '/login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: '/forgot-password',
        element: (
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  // Dedicated Customer Dashboard Layout & Routes
  {
    path: '/customer',
    element: (
      <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
        <CustomerLayout />
      </RoleProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <CustomerDashboard />,
      },
    ],
  },
  // Dedicated Shopkeeper Dashboard Layout & Routes
  {
    path: '/shopkeeper',
    element: (
      <RoleProtectedRoute allowedRoles={['SHOPKEEPER']}>
        <ShopkeeperLayout />
      </RoleProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <ShopkeeperDashboard />,
      },
    ],
  },
  // Dedicated Admin Dashboard Layout & Routes
  {
    path: '/admin',
    element: (
      <RoleProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </RoleProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
    ],
  },
])
export default router

