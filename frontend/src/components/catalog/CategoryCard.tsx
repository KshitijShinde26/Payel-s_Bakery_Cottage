import React from 'react'
import { Link } from 'react-router-dom'
import type { CategoryInfo } from '@/features/catalog/types'
import { ArrowRight } from 'lucide-react'

export interface CategoryCardProps {
  category: CategoryInfo
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-amber-100/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300"
    >
      <div className="aspect-4/3 overflow-hidden bg-amber-50 relative">
        <img
          src={category.image}
          alt={`${category.name} collection at Payal's Bakery Cottage`}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/images/Logo.jpeg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            {category.itemCount} Varieties
          </span>
          <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-200 transition-colors">
            {category.name}
          </h3>
        </div>
      </div>

      <div className="p-4 flex flex-1 flex-col justify-between">
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {category.description}
        </p>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800">
          <span>Explore Category</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
export default CategoryCard
