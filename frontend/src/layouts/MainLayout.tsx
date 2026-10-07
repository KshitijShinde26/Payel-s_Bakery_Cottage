import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/10">
      {/* Header Navigation */}
      <Header
        onToggleMobileMenu={handleToggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Drawer Overlay */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer Branding */}
      <Footer />
    </div>
  )
}
