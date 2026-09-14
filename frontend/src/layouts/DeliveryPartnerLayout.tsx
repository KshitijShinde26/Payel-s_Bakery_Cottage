import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  Truck,
  LogOut,
  ChevronDown,
} from 'lucide-react'

export const DeliveryPartnerLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-stone-900 text-white shadow-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Role */}
            <div className="flex items-center gap-3">
              <Link to="/delivery-partner/dashboard" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md font-serif font-bold text-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif font-bold text-amber-400 text-base sm:text-lg tracking-tight block leading-tight">
                    Payal's Bakery Cottage
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300/80 block">
                    Delivery Partner Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Status badge + User menu */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>On Duty • Active</span>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-800 transition-colors border border-stone-700 focus-ring"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user?.fullName?.charAt(0) || 'D'}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-semibold text-stone-100 block truncate max-w-[130px]">
                      {user?.fullName || 'Delivery Partner'}
                    </span>
                    <span className="text-[10px] text-amber-400 uppercase font-medium">Delivery Fleet</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-stone-800 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-stone-100 bg-amber-50/40">
                        <p className="text-xs font-bold text-stone-900 truncate">{user?.fullName}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                          DELIVERY_PARTNER
                        </span>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out Fleet</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} Payal's Bakery Cottage • Secure Delivery Network</p>
      </footer>
    </div>
  )
}
export default DeliveryPartnerLayout
