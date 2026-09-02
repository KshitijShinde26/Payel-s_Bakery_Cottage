import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  User as UserIcon,
  LogOut,
  Settings,
  Search,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

export interface HeaderProps {
  onToggleMobileMenu: () => void
  isMobileMenuOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItemCount } = useCart()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const activeClass = (path: string) =>
    location.pathname === path
      ? 'text-amber-700 font-bold border-b-2 border-amber-600 pb-1'
      : 'text-stone-700 hover:text-amber-700 transition-colors font-medium'

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    navigate('/')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-100 bg-white/95 backdrop-blur-md shadow-xs transition-all duration-200">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group focus-ring rounded-xl p-1">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-amber-200/80 group-hover:scale-105 transition-transform bg-amber-50 shrink-0">
            <img
              src="/images/Logo.jpeg"
              alt="Payal's Bakery Cottage Logo"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="text-left">
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight group-hover:text-amber-800 transition-colors block leading-tight">
              Payal's Bakery Cottage
            </span>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              100% Eggless Homemade Bakes
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          <Link to="/" className={activeClass('/')}>
            Home
          </Link>
          <Link to="/products" className={activeClass('/products')}>
            All Products
          </Link>
          <Link
            to={isAuthenticated && user?.role === 'CUSTOMER' ? '/customer/customize-cake' : '/products?category=Customized%20Cakes'}
            className="text-stone-700 hover:text-amber-700 transition-colors font-medium"
          >
            Custom Cakes
          </Link>

          <Link
            to="/#about"
            className="text-stone-700 hover:text-amber-700 transition-colors font-medium"
          >
            About Bakery
          </Link>
        </nav>

        {/* Action Badges & Profile Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search cakes, cookies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-44 sm:w-60 text-xs px-3 py-1.5 rounded-full border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 p-1 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="text-stone-600 hover:text-amber-700 transition-colors p-2 rounded-full hover:bg-amber-50 cursor-pointer focus-ring"
                title="Search Products"
                aria-label="Search Products"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Wishlist button */}
          <Link
            to={isAuthenticated ? (user?.role === 'CUSTOMER' ? '/wishlist' : '/customer/dashboard') : '/login'}
            className="text-stone-600 hover:text-amber-700 transition-colors p-2 rounded-full hover:bg-amber-50 cursor-pointer focus-ring relative hidden sm:inline-flex"
            title="My Wishlist"
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart button */}
          <Link
            to={isAuthenticated ? (user?.role === 'CUSTOMER' ? '/cart' : '/customer/dashboard') : '/login'}
            className="text-stone-600 hover:text-amber-700 transition-colors p-2 rounded-full hover:bg-amber-50 cursor-pointer focus-ring relative inline-flex"
            title="Shopping Cart"
            aria-label={`Shopping Cart (${totalItemCount} items)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItemCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white animate-scaleUp">
                {totalItemCount}
              </span>
            )}
          </Link>


          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full focus-ring cursor-pointer hover:ring-2 hover:ring-amber-300"
                aria-expanded={isDropdownOpen}
              >
                <Avatar
                  src={user?.avatarUrl}
                  alt={user?.fullName}
                  fallback={user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                  className="h-9 w-9 border border-amber-300 bg-amber-600 text-white font-semibold"
                />
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-amber-100 bg-white py-2 shadow-xl ring-1 ring-black/5 z-40 animate-fadeIn">
                    <div className="border-b border-stone-100 px-4 py-2 text-xs text-stone-500">
                      <p className="font-bold text-stone-800 truncate">{user?.fullName}</p>
                      <p className="truncate text-stone-500 text-[11px]">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to={
                        user?.role === 'ADMIN'
                          ? '/admin/dashboard'
                          : user?.role === 'SHOPKEEPER'
                            ? '/shopkeeper/dashboard'
                            : '/customer/dashboard'
                      }
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-amber-600" />
                      <span>
                        {user?.role === 'ADMIN'
                          ? 'Admin Dashboard'
                          : user?.role === 'SHOPKEEPER'
                            ? 'Shopkeeper Desk'
                            : 'Customer Dashboard'}
                      </span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-stone-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer border-t border-stone-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden sm:inline-block">
              <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="rounded-lg p-2 text-stone-600 hover:bg-amber-50 hover:text-amber-700 md:hidden cursor-pointer focus-ring"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  )
}
export default Header

