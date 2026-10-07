import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  LayoutDashboard,
  CakeSlice,
  ClipboardList,
  Flame,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
  Sparkles,
} from 'lucide-react'

export const ShopkeeperLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const currentHash = location.hash || '#overview'

  const navItems = [
    { label: 'Kitchen Overview', icon: LayoutDashboard, hash: '#overview', to: '/shopkeeper/dashboard#overview' },
    { label: 'Kitchen Queue', icon: Flame, hash: '#queue', to: '/shopkeeper/dashboard#queue', badge: 'Live' },
    { label: 'Manage Orders', icon: ClipboardList, hash: '#orders', to: '/shopkeeper/dashboard#orders' },
    { label: 'Custom Cakes', icon: Sparkles, hash: '#custom_cakes', to: '/shopkeeper/dashboard#custom_cakes' },
    { label: 'Product Reference', icon: CakeSlice, hash: '#products', to: '/shopkeeper/dashboard#products' },
    { label: 'My Profile', icon: User, hash: '', to: '/profile' },
  ]

  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col">
      {/* Shopkeeper Top Header */}
      <header className="sticky top-0 z-30 bg-stone-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu trigger + Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 focus-ring"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/shopkeeper/dashboard#overview" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md font-serif font-bold text-lg">
                  P
                </div>
                <div>
                  <span className="font-serif font-bold text-amber-400 text-lg sm:text-xl tracking-tight block leading-tight">
                    Payal's Bakery Cottage
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
                    Shopkeeper Operations Desk
                  </span>
                </div>
              </Link>
            </div>

            {/* Operational Status & Profile Menu */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Kitchen Active • Online</span>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-800 transition-colors focus-ring border border-stone-800"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-serif font-semibold text-sm shadow-sm">
                    {user?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-semibold text-stone-100 block truncate max-w-[120px]">
                      {user?.fullName || 'Shop Manager'}
                    </span>
                    <span className="text-[10px] text-amber-400 uppercase font-medium">Shopkeeper</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Role: SHOPKEEPER
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-600" />
                      Manage Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 py-6 pr-6 border-r border-stone-200 bg-white/70">
          <div className="sticky top-24 space-y-1">
            <div className="px-3 pb-3 text-[11px] font-bold tracking-wider text-stone-400 uppercase">
              Operations Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.hash ? currentHash === item.hash : location.pathname === item.to
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                      : 'text-stone-700 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            <div className="pt-6 mt-4 border-t border-stone-200 px-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-serif font-bold">
                    P
                  </div>
                  <span className="font-serif font-bold text-stone-900 text-sm">Shopkeeper Desk</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 py-2 border-b border-stone-100">
                <p className="text-xs font-bold text-stone-800">{user?.fullName}</p>
                <p className="text-[11px] text-stone-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Role: SHOPKEEPER
                </span>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.hash ? currentHash === item.hash : location.pathname === item.to
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-amber-600 text-white font-semibold shadow-sm'
                          : 'text-stone-700 hover:bg-amber-50 hover:text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-amber-700" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Dynamic Main Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default ShopkeeperLayout
