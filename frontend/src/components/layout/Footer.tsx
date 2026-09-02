import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-amber-100 bg-stone-900 text-stone-300 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-2">
            <span className="text-xl font-bold font-serif text-white tracking-wide block mb-3">
              Payal's Bakery Cottage
            </span>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed mb-4">
              Delicious freshly-prepared homemade bakery treats, special occasion customized cakes, and sweet memories crafted daily with love and premium ingredients.
            </p>
            <p className="text-xs text-amber-500 font-medium">
              * Please place custom orders at least 1 day in advance.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-serif">
              Our Cottage
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">
                  Cakes & Pastries
                </Link>
              </li>
              <li>
                <Link to="/customer/customize-cake" className="hover:text-amber-400 transition-colors">
                  Custom Configurator
                </Link>
              </li>
              <li>
                <Link to="/products?category=Breads" className="hover:text-amber-400 transition-colors">
                  Fresh Breads
                </Link>
              </li>
              <li>
                <Link to="/products?category=Cookies%20%26%20Biscuits" className="hover:text-amber-400 transition-colors">
                  Cookies & Biscuits
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-serif">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <span>Line 1, Cottage Road, Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amber-600 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-600 shrink-0" />
                <span>orders@payalsbakery.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>&copy; {currentYear} Payal's Bakery Cottage. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="hover:underline cursor-not-allowed">Privacy Policy</span>
            <span className="hover:underline cursor-not-allowed">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
