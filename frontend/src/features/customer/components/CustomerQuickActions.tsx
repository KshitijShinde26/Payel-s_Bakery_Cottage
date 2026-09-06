import React from 'react'
import { Link } from 'react-router-dom'
import {
  Cake,
  Wand2,
  Sparkles,
  ShoppingBag,
  Heart,
  Package,
  User,
  ArrowRight,
} from 'lucide-react'

interface CustomerQuickActionsProps {
  cartItemCount: number
  wishlistCount: number
}

export const CustomerQuickActions: React.FC<CustomerQuickActionsProps> = ({
  cartItemCount,
  wishlistCount,
}) => {
  const actions = [
    {
      title: 'Browse Fresh Bakes',
      description: 'Explore 100% eggless cakes, pastries & bread',
      icon: Cake,
      link: '/products',
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Design Custom Cake',
      description: 'Upload reference design photo & select flavours',
      icon: Wand2,
      link: '/customer/customize-cake',
      color: 'from-amber-600 to-amber-700',
    },
    {
      title: 'Custom Cake Requests',
      description: 'Track kitchen reviews, feasibility & design quotes',
      icon: Sparkles,
      link: '/customer/custom-cakes',
      color: 'from-amber-700 to-amber-800',
    },
    {
      title: 'My Shopping Cart',
      description: `${cartItemCount} ${cartItemCount === 1 ? 'bake' : 'bakes'} ready for celebration`,
      icon: ShoppingBag,
      link: '/cart',
      color: 'from-emerald-600 to-emerald-700',
    },
    {
      title: 'Saved Wishlist',
      description: `${wishlistCount} ${wishlistCount === 1 ? 'bake' : 'bakes'} saved for later`,
      icon: Heart,
      link: '/wishlist',
      color: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Order History',
      description: 'Track current progress or reorder past favorites',
      icon: Package,
      link: '/customer/orders',
      color: 'from-stone-700 to-stone-900',
    },
    {
      title: 'Profile & Security',
      description: 'Manage personal details, avatar & password',
      icon: User,
      link: '/profile',
      color: 'from-stone-600 to-stone-800',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Bakery Services & Quick Navigation
        </h2>
        <span className="text-xs text-amber-800 font-semibold">Cottage Hub</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              to={action.link}
              className="group relative bg-white rounded-3xl p-5 border border-amber-100/80 hover:border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                <span>Open Service</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
