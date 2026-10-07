import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/hooks/AuthContext'
import { CartProvider } from '@/features/cart/context/CartContext'
import { WishlistProvider } from '@/features/wishlist/context/WishlistContext'
import { Toaster } from '@/components/ui/Toast'
import { router } from '@/routes'

// Create a client for TanStack Query with standard defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}


export default App
