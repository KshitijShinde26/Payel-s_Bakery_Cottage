import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { SkeletonCard } from '@/components/catalog/SkeletonCard'
import { productService } from '@/features/catalog/services/productService'
import type { Product, CategoryInfo } from '@/features/catalog/types'
import {
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  Cake,
  MapPin,
  Phone,
  Tag,
  Star,
} from 'lucide-react'

import { motion } from 'framer-motion'

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set page title for SEO
    document.title = "Payal's Bakery Cottage | 100% Eggless Homemade Bakery in Barrackpore, Kolkata"

    const loadData = async () => {
      try {
        setLoading(true)
        const [featured, best, cats] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getBestSellers(),
          productService.getCategories(),
        ])
        setFeaturedProducts(featured.slice(0, 4))
        setBestSellers(best.slice(0, 4))
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load homepage catalog data', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 py-16 sm:py-24 lg:py-28 border-b border-amber-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-6"
              >
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>100% Eggless • Freshly Baked with Love</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-stone-900 leading-[1.12]"
              >
                Artisanal Homemade <br className="hidden sm:inline" />
                <span className="text-amber-700">Cakes & Bakes</span> For Every Celebration
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed font-sans"
              >
                Welcome to <strong>Payal's Bakery Cottage</strong>, a boutique home kitchen in Barrackpore, Kolkata. Every cake, pastry, and cookie is freshly prepared to order using pure ingredients without artificial preservatives.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link to="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md text-base px-8 py-3.5">
                    Shop Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/products?category=Customized%20Cakes" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-amber-300 text-amber-900 hover:bg-amber-100/60 rounded-xl text-base px-8 py-3.5"
                  >
                    Customize Your Cake
                  </Button>
                </Link>
              </motion.div>

              {/* Highlights pills */}
              <div className="mt-10 pt-8 border-t border-amber-100/80 grid grid-cols-3 gap-4 w-full max-w-lg text-left">
                <div>
                  <p className="text-xl font-bold font-serif text-stone-900">100%</p>
                  <p className="text-xs text-stone-500 font-medium">Pure Eggless</p>
                </div>
                <div>
                  <p className="text-xl font-bold font-serif text-stone-900">Fresh</p>
                  <p className="text-xs text-stone-500 font-medium">Baked to Order</p>
                </div>
                <div>
                  <p className="text-xl font-bold font-serif text-stone-900">Local</p>
                  <p className="text-xs text-stone-500 font-medium">Kolkata Delivery</p>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Showcase Cake Card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl border border-amber-200/80"
              >
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-amber-50">
                  <img
                    src="/images/Product_10.jpeg"
                    alt="Handcrafted Celebration Cake by Payel Acharya"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 text-white backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Signature Creation
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Customized Masterpiece</span>
                    <span className="text-base font-extrabold text-stone-900">₹1,350</span>
                  </div>
                  <h3 className="mt-1 text-base font-bold font-serif text-stone-900">
                    Grand Rosette & Caramel Drip Cake
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Handcrafted celebration cake with fresh piped rosettes and golden caramel drizzle.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bakery Introduction (Authentic Details) */}
      <section id="about" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-200 bg-amber-50 aspect-square">
                <img
                  src="/images/Product_6.jpeg"
                  alt="Payal's Bakery Cottage Fresh Bakes"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <img src="/images/Logo.jpeg" alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 font-serif">Payel Acharya</h4>
                      <p className="text-[11px] text-amber-800 font-medium">Head Baker & Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
                Our Story & Craft
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                Authentic Homemade Baking with Pure Ingredients
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed font-sans text-base">
                <strong>Payal's Bakery Cottage</strong> is an independent home bakery based in Barrackpore, Kolkata. Founded with a passion for traditional artisan baking, every single cake, pastry, loaf, and cookie batch is whipped, kneaded, and baked on-demand with 100% vegetarian, eggless ingredients.
              </p>
              <p className="mt-3 text-stone-600 leading-relaxed font-sans text-sm">
                We believe that special milestones—from birthdays and anniversaries to daily tea-time moments—deserve real homemade taste made without shortcuts, commercial pre-mixes, or artificial preservatives.
              </p>

              {/* Verified Location & Contact */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold">Kitchen Location</strong>
                    <span className="text-stone-600">113/A, Muktapukur, Natunpara, Barrackpore, Kolkata - 700123</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold">Contact & Inquiries</strong>
                    <span className="text-stone-600">+91 6290003229 (Payel Acharya)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Categories Grid */}
      <section id="categories" className="py-16 sm:py-20 bg-amber-50/40 border-y border-amber-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
                Explore Our Kitchen
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
                Fresh Bakery Categories
              </h2>
            </div>
            <Link
              to="/products"
              className="mt-4 md:mt-0 text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5"
            >
              <span>View Full Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Products Showcase */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
                Chef's Handpicked
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
                Featured Bakes
              </h2>
              <p className="mt-2 text-stone-500 text-sm">
                Our most celebrated freshly baked creations crafted for special occasions.
              </p>
            </div>
            <Link
              to="/products"
              className="mt-4 md:mt-0 text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5"
            >
              <span>See All Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 5. Special Promotional Offer */}
      <section className="py-12 bg-amber-700 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-100 text-xs font-bold uppercase tracking-wider mb-3">
                <Tag className="w-3.5 h-3.5" />
                Special Introductory Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif">
                Enjoy 10% Off Your First Homemade Celebration Order
              </h3>
              <p className="mt-2 text-amber-100 text-sm leading-relaxed">
                Use promo coupon code <strong className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">COTTAGE10</strong> during checkout. Valid on all custom celebration cakes and handcrafted party bakes.
              </p>
            </div>
            <Link to="/products">
              <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50 font-bold rounded-xl shadow-lg shrink-0">
                Browse Menu & Redeem
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Best Sellers */}
      <section className="py-16 sm:py-20 bg-amber-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
              Community Favorites
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
              Customer Best Sellers
            </h2>
            <p className="mt-2 text-stone-500 text-sm">
              Tried, tested, and loved by families across Barrackpore and Kolkata.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 7. Bakery Guarantees / Core Values */}
      <section className="py-16 bg-white border-t border-amber-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-serif text-stone-900">100% Eggless Recipes</h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                All our products are strictly vegetarian and eggless, baked with fresh dairy cream, butter, and natural flavorings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-serif text-stone-900">Freshly Baked On-Demand</h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                No stale shelves. Your cake is prepared from scratch shortly before your requested delivery or pickup time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Cake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-serif text-stone-900">Custom Event Designs</h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Personalized custom themes, custom messages, tiers, and flavors crafted to match your milestone celebrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Genuine Customer Appreciation & Testimonials */}
      <section className="py-16 sm:py-20 bg-amber-50/40 border-t border-amber-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
              Customer Love
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
              Baked with Care for Every Occasion
            </h2>
            <p className="mt-2 text-stone-500 text-sm">
              Heartfelt feedback from family celebrations and sweet gatherings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-amber-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  "The chocolate marble birthday cake for our Dada was absolutely wonderful. The design was gorgeous and it tasted so fresh and light. Everyone loved it!"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                  B
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Birthday Order Customer</h4>
                  <span className="text-[10px] text-stone-500">Barrackpore</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-amber-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  "The Anniversary Drip Cake with red rosettes looked even better than we hoped. Payel di took such care in designing it. Best 100% eggless cake we have had."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Anniversary Celebration</h4>
                  <span className="text-[10px] text-stone-500">Kolkata</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-amber-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  "Traditional plum cake with roasted cashews and soaked cherries was incredible for our winter party. Real home taste without artificial essence."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                  S
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Festive Plum Cake Order</h4>
                  <span className="text-[10px] text-stone-500">Natunpara</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
export default HomePage
