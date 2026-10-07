import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ShoppingBag, Layers, LogIn, User as UserIcon, Wand2, LayoutDashboard, X } from 'lucide-react'

export interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  const activeClass = (path: string) =>
    location.pathname === path
      ? 'flex items-center space-x-3 px-4 py-3 rounded-xl text-amber-800 bg-amber-50 font-bold border border-amber-200'
      : 'flex items-center space-x-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-amber-50/50 hover:text-amber-800 transition-all font-medium'

  const dashboardRoute =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'SHOPKEEPER'
        ? '/shopkeeper/dashboard'
        : '/customer/dashboard'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl p-6 md:hidden flex flex-col justify-between overflow-y-auto"
          >
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <img src="/images/Logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-base font-bold font-serif text-stone-900">
                    Payal's Bakery
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col space-y-1.5">
                <Link to="/" onClick={onClose} className={activeClass('/')}>
                  <Home className="h-5 w-5 text-amber-600" />
                  <span>Home</span>
                </Link>
                <Link to="/products" onClick={onClose} className={activeClass('/products')}>
                  <ShoppingBag className="h-5 w-5 text-amber-600" />
                  <span>All Products</span>
                </Link>
                <Link
                  to="/products?category=Customized%20Cakes"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-all font-medium"
                >
                  <Wand2 className="h-5 w-5 text-amber-600" />
                  <span>Custom Cakes</span>
                </Link>
                <Link
                  to="/#categories"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-all font-medium"
                >
                  <Layers className="h-5 w-5 text-amber-600" />
                  <span>Categories</span>
                </Link>

                {isAuthenticated && (
                  <>
                    <Link to={dashboardRoute} onClick={onClose} className={activeClass(dashboardRoute)}>
                      <LayoutDashboard className="h-5 w-5 text-amber-600" />
                      <span>{user?.role === 'ADMIN' ? 'Admin Dashboard' : user?.role === 'SHOPKEEPER' ? 'Shopkeeper Desk' : 'Customer Dashboard'}</span>
                    </Link>
                    <Link to="/profile" onClick={onClose} className={activeClass('/profile')}>
                      <UserIcon className="h-5 w-5 text-amber-600" />
                      <span>My Profile</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Bottom Button Action */}
            <div className="border-t border-stone-100 pt-4">
              {isAuthenticated ? (
                <div className="text-stone-600 text-xs px-2 mb-2">
                  Signed in as <strong className="text-stone-800">{user?.fullName}</strong>
                  <span className="block text-[10px] text-amber-700 uppercase font-semibold mt-0.5">Role: {user?.role}</span>
                </div>
              ) : (
                <Link to="/login" onClick={onClose}>
                  <Button variant="primary" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
export default MobileNav

