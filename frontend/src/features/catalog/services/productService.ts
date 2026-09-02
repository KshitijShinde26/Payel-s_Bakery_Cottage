import { apiClient } from '@/lib/apiClient'
import type { Product, CategoryInfo, ProductFilterParams } from '../types'

// Client-provided authentic product catalog using official bakery images (fallback / seed data)
export const CLIENT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Traditional Rich Plum & Dry Fruit Cake',
    category: 'Cakes',
    price: 650,
    originalPrice: 750,
    description:
      'Our signature 100% eggless rich plum cake loaded with soaked candied cherries, plump raisins, roasted cashews, and aromatic festive spices. Baked slowly for deep, traditional homemade flavor.',
    shortDescription: 'Classic eggless plum cake packed with soaked fruits and roasted nuts.',
    image: '/images/Product_1.jpeg',
    gallery: ['/images/Product_1.jpeg', '/images/Product_11.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    shelfLife: '7–10 days in an airtight container',
    allergens: ['Tree Nuts (Cashews, Almonds)', 'Gluten (Wheat)'],
    ingredients: ['Refined Wheat Flour', 'Brown Sugar', 'Butter', 'Soaked Cherries', 'Cashews', 'Raisins', 'Nutmeg', 'Cinnamon'],
    weightOptions: ['500g', '1kg', '1.5kg'],
    minLeadTimeHours: 24,
    rating: 4.9,
    reviewCount: 48,
  },
  {
    id: 'prod-2',
    name: 'Custom Chocolate Marbled Birthday Cake',
    category: 'Customized Cakes',
    price: 850,
    description:
      'Handcrafted eggless chocolate cake with an intricate spiderweb chocolate-vanilla ganache glaze. Includes a personalized festive celebration plaque.',
    shortDescription: 'Custom birthday cake with signature marbled glaze and custom topper.',
    image: '/images/Product_2.jpeg',
    gallery: ['/images/Product_2.jpeg', '/images/Product_6.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    shelfLife: '3–4 days refrigerated',
    allergens: ['Dairy (Milk, Butter)', 'Gluten (Wheat)', 'Soy Lecithin'],
    ingredients: ['Dutch Cocoa', 'Flour', 'Condensed Milk', 'Butter', 'Dark Chocolate Ganache', 'Vanilla Extract'],
    weightOptions: ['1kg', '1.5kg', '2kg'],
    minLeadTimeHours: 24,
    rating: 5.0,
    reviewCount: 62,
  },
  {
    id: 'prod-3',
    name: 'Royal Red Rosette Celebration Cake',
    category: 'Cakes',
    price: 950,
    originalPrice: 1100,
    description:
      'A stunning showstopper cake layered with velvety whipped cream and crowned with handcrafted fresh red rose buttercream swirls and edible sugar pearls.',
    shortDescription: 'Velvety cream cake adorned with vibrant red rosette piping.',
    image: '/images/Product_3.jpeg',
    gallery: ['/images/Product_3.jpeg', '/images/Product_10.jpeg'],
    isEggless: true,
    isAvailable: true,
    isFeatured: true,
    shelfLife: '2–3 days refrigerated',
    allergens: ['Dairy (Cream, Butter)', 'Gluten (Wheat)'],
    ingredients: ['Wheat Flour', 'Fresh Cream', 'Sugar', 'Butter', 'Natural Vanilla', 'Edible Food Color'],
    weightOptions: ['1kg', '1.5kg', '2kg'],
    minLeadTimeHours: 24,
    rating: 4.8,
    reviewCount: 35,
  },
  {
    id: 'prod-4',
    name: 'Artisanal Truffle & Vanilla Swirl Cake',
    category: 'Cakes',
    price: 780,
    description:
      'Rich layers of dark chocolate sponge soaked in sugar syrup, filled with rich chocolate mousse and finished with delicate vanilla-cocoa radial swirl icing.',
    shortDescription: 'Dark chocolate sponge layered with creamy vanilla-cocoa swirl frosting.',
    image: '/images/Product_4.jpeg',
    gallery: ['/images/Product_4.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: false,
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy (Milk)', 'Gluten (Wheat)'],
    ingredients: ['Dark Chocolate', 'Dairy Cream', 'Flour', 'Cocoa Powder', 'Sugar'],
    weightOptions: ['500g', '1kg'],
    minLeadTimeHours: 12,
    rating: 4.7,
    reviewCount: 29,
  },
  {
    id: 'prod-5',
    name: 'Golden Buttercream Drip Celebration Cake',
    category: 'Cakes',
    price: 890,
    description:
      'Soft vanilla sponge with rich whipped caramel cream filling, decadent dark chocolate ganache drip, and handcrafted floral rosettes.',
    shortDescription: 'Vanilla-caramel sponge with chocolate drip and rosette decor.',
    image: '/images/Product_5.jpeg',
    gallery: ['/images/Product_5.jpeg'],
    isEggless: true,
    isAvailable: true,
    isFeatured: false,
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy', 'Gluten'],
    ingredients: ['Flour', 'Butter', 'Cream', 'Caramel Syrup', 'Chocolate Drip'],
    weightOptions: ['1kg', '1.5kg'],
    minLeadTimeHours: 24,
    rating: 4.8,
    reviewCount: 19,
  },
  {
    id: 'prod-6',
    name: '"Maa" Special Celebration Marble Cake',
    category: 'Customized Cakes',
    price: 900,
    description:
      'Special occasion celebration cake designed with chocolate marbling, fresh cream rosettes, sparkling silver pearls, and handcrafted chocolate plaque.',
    shortDescription: 'Custom celebration cake featuring artisan marbled design and personalized plaque.',
    image: '/images/Product_6.jpeg',
    gallery: ['/images/Product_6.jpeg', '/images/Product_2.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    shelfLife: '3–4 days refrigerated',
    allergens: ['Dairy', 'Gluten', 'Soy'],
    ingredients: ['Cocoa', 'Cream', 'Wheat Flour', 'Sugar', 'Silver Dragees', 'Glaze'],
    weightOptions: ['1kg', '1.5kg', '2kg'],
    minLeadTimeHours: 24,
    rating: 5.0,
    reviewCount: 54,
  },
  {
    id: 'prod-7',
    name: 'Classic Fresh Strawberry Cream Gateau',
    category: 'Cakes',
    price: 820,
    description:
      'Light sponge cake layered with sweet strawberry fruit compote, whipped vanilla cream, and chocolate lace decoration.',
    shortDescription: 'Fruity strawberry gateau layered with silky whipped dairy cream.',
    image: '/images/Product_7.jpeg',
    gallery: ['/images/Product_7.jpeg'],
    isEggless: true,
    isAvailable: true,
    isFeatured: false,
    shelfLife: '2 days refrigerated',
    allergens: ['Dairy', 'Gluten'],
    ingredients: ['Strawberry Compote', 'Dairy Cream', 'Flour', 'Sugar', 'Vanilla'],
    weightOptions: ['500g', '1kg'],
    minLeadTimeHours: 12,
    rating: 4.7,
    reviewCount: 22,
  },
  {
    id: 'prod-8',
    name: 'Signature Caramel & Cocoa Ripple Pastry',
    category: 'Pastries',
    price: 150,
    description:
      'Single-serve layered eggless pastry with dark cocoa sponge, silky caramel mousse, and chocolate shavings.',
    shortDescription: 'Individual chocolate caramel pastry slice with delicate ganache drip.',
    image: '/images/Product_8.jpeg',
    gallery: ['/images/Product_8.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    shelfLife: '2 days refrigerated',
    allergens: ['Dairy', 'Gluten'],
    ingredients: ['Cocoa', 'Caramel', 'Wheat Flour', 'Fresh Cream'],
    weightOptions: ['Single Slice', 'Box of 2', 'Box of 4'],
    minLeadTimeHours: 6,
    rating: 4.9,
    reviewCount: 41,
  },
  {
    id: 'prod-9',
    name: 'Velvet Strawberry Fantasy Pastry',
    category: 'Pastries',
    price: 160,
    description:
      'A delicate single-portion eggless pastry layered with crushed strawberries, vanilla creme, and glazed with white chocolate curls.',
    shortDescription: 'Fresh strawberry and vanilla layered pastry slice.',
    image: '/images/Product_9.jpeg',
    gallery: ['/images/Product_9.jpeg'],
    isEggless: true,
    isAvailable: true,
    shelfLife: '2 days refrigerated',
    allergens: ['Dairy', 'Gluten'],
    ingredients: ['Strawberries', 'White Chocolate', 'Cream', 'Flour'],
    weightOptions: ['Single Slice', 'Box of 2'],
    minLeadTimeHours: 6,
    rating: 4.6,
    reviewCount: 18,
  },
  {
    id: 'prod-10',
    name: '"Happy Anniversary" Grand Rosette Drip Cake',
    category: 'Customized Cakes',
    price: 1350,
    originalPrice: 1500,
    description:
      'Grand double-flavor celebration cake. Half covered in red rosette piping with silver pearls, and half finished in dark chocolate crumble with golden caramel drip and acrylic anniversary topper.',
    shortDescription: 'Stunning half-and-half anniversary cake with dual textures and toppers.',
    image: '/images/Product_10.jpeg',
    gallery: ['/images/Product_10.jpeg', '/images/Product_12.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy', 'Gluten', 'Soy'],
    ingredients: ['Dutch Cocoa', 'Strawberry Frosting', 'Fresh Cream', 'Wheat Flour', 'Caramel Drip', 'Sugar Pearls'],
    weightOptions: ['1.5kg', '2kg', '3kg'],
    minLeadTimeHours: 48,
    rating: 5.0,
    reviewCount: 76,
  },
  {
    id: 'prod-11',
    name: 'Homemade Dark Chocolate Walnut Brownie (Box of 4)',
    category: 'Pastries',
    price: 340,
    description:
      'Dense, fudgy eggless chocolate brownies studded with toasted crunchy walnuts and melted dark chocolate chunks.',
    shortDescription: 'Fudgy eggless chocolate brownies loaded with toasted walnuts.',
    image: '/images/Product_11.jpeg',
    gallery: ['/images/Product_11.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    shelfLife: '5 days in an airtight container',
    allergens: ['Tree Nuts (Walnuts)', 'Dairy', 'Gluten'],
    ingredients: ['Dark Chocolate 55%', 'Butter', 'Walnuts', 'Flour', 'Brown Sugar'],
    weightOptions: ['Box of 4', 'Box of 8'],
    minLeadTimeHours: 12,
    rating: 4.9,
    reviewCount: 52,
  },
  {
    id: 'prod-12',
    name: 'Multi-Tier Royal Anniversary & Wedding Cake',
    category: 'Customized Cakes',
    price: 2400,
    description:
      'Custom 2-tier or 3-tier celebration masterpiece tailored to your theme, flavors, floral arrangements, and personalized messages.',
    shortDescription: 'Multi-tier tiered celebration cake handcrafted for weddings and milestones.',
    image: '/images/Product_12.jpeg',
    gallery: ['/images/Product_12.jpeg', '/images/Product_10.jpeg'],
    isEggless: true,
    isAvailable: true,
    isFeatured: true,
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy', 'Gluten', 'Tree Nuts (Optional)'],
    ingredients: ['Custom Flavors', 'Fresh Whipped Cream', 'Buttercream', 'Edible Accents'],
    weightOptions: ['2kg', '3kg', '5kg'],
    minLeadTimeHours: 48,
    rating: 5.0,
    reviewCount: 38,
  },
  {
    id: 'prod-13',
    name: 'Decadent Dark Chocolate Truffle Gateau',
    category: 'Cakes',
    price: 880,
    description:
      'Pure chocolate lover indulgence. Three layers of moist chocolate sponge filled and frosted with 60% dark chocolate truffle ganache.',
    shortDescription: 'Triple-layer chocolate cake loaded with rich dark truffle ganache.',
    image: '/images/Product_13.jpeg',
    gallery: ['/images/Product_13.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    shelfLife: '4 days refrigerated',
    allergens: ['Dairy', 'Gluten', 'Soy'],
    ingredients: ['Dark Chocolate Ganache', 'Cocoa Sponge', 'Butter', 'Cream'],
    weightOptions: ['500g', '1kg', '1.5kg'],
    minLeadTimeHours: 12,
    rating: 4.9,
    reviewCount: 67,
  },
  {
    id: 'prod-14',
    name: 'Handcrafted Butter Cookies & Biscuits (Pack of 12)',
    category: 'Cookies',
    price: 260,
    description:
      'Melt-in-your-mouth artisanal eggless butter cookies baked to golden perfection with real dairy butter and hints of cardamom.',
    shortDescription: 'Crisp, crumbly homemade butter cookies baked fresh daily.',
    image: '/images/Product_14.jpeg',
    gallery: ['/images/Product_14.jpeg'],
    isEggless: true,
    isAvailable: true,
    shelfLife: '15 days in an airtight jar',
    allergens: ['Dairy (Butter)', 'Gluten (Wheat)'],
    ingredients: ['Pure Dairy Butter', 'Flour', 'Icing Sugar', 'Cardamom', 'Vanilla'],
    weightOptions: ['Pack of 12 (250g)', 'Pack of 24 (500g)'],
    minLeadTimeHours: 12,
    rating: 4.8,
    reviewCount: 44,
  },
  {
    id: 'prod-15',
    name: 'Artisanal Sourdough & Herb Bread Loaf',
    category: 'Breads',
    price: 190,
    description:
      'Slow-fermented artisan homemade bread loaf infused with dried oregano, thyme, garlic, and extra virgin olive oil with a crisp crust.',
    shortDescription: 'Slow-fermented crusty artisan loaf with rosemary and garlic.',
    image: '/images/Product_15.jpeg',
    gallery: ['/images/Product_15.jpeg'],
    isEggless: true,
    isAvailable: true,
    shelfLife: '3–4 days room temperature',
    allergens: ['Gluten (Wheat)'],
    ingredients: ['Stone-ground Wheat Flour', 'Water', 'Sea Salt', 'Natural Sourdough Starter', 'Herbs'],
    weightOptions: ['400g Loaf'],
    minLeadTimeHours: 24,
    rating: 4.7,
    reviewCount: 26,
  },
  {
    id: 'prod-16',
    name: 'Assorted Floral Buttercream Cupcakes (Box of 6)',
    category: 'Cupcakes',
    price: 450,
    description:
      'Box of 6 moist eggless cupcakes in vanilla, red velvet, and chocolate topped with handcrafted piped floral rosettes in vibrant pastels.',
    shortDescription: 'Box of 6 assorted moist cupcakes with delicate buttercream flowers.',
    image: '/images/Product_16.jpeg',
    gallery: ['/images/Product_16.jpeg', '/images/Product_17.jpeg'],
    isEggless: true,
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy', 'Gluten'],
    ingredients: ['Wheat Flour', 'Buttercream', 'Sugar', 'Natural Flavors'],
    weightOptions: ['Box of 6', 'Box of 12'],
    minLeadTimeHours: 12,
    rating: 4.9,
    reviewCount: 50,
  },
  {
    id: 'prod-17',
    name: 'Rich Chocolate Lava Cupcakes (Box of 4)',
    category: 'Cupcakes',
    price: 320,
    description:
      'Decadent eggless chocolate cupcakes with a warm, gooey molten chocolate ganache core. Warm for 10 seconds before serving!',
    shortDescription: 'Decadent cupcakes with a gooey molten chocolate ganache center.',
    image: '/images/Product_17.jpeg',
    gallery: ['/images/Product_17.jpeg'],
    isEggless: true,
    isAvailable: true,
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy', 'Gluten', 'Soy'],
    ingredients: ['Dark Chocolate', 'Butter', 'Flour', 'Brown Sugar'],
    weightOptions: ['Box of 4', 'Box of 8'],
    minLeadTimeHours: 12,
    rating: 4.9,
    reviewCount: 37,
  },
  {
    id: 'prod-18',
    name: 'Custom Theme Tiered Party Cake',
    category: 'Customized Cakes',
    price: 1800,
    description:
      'Bespoke celebration cake custom sculpted and themed to your party style. Choose your flavors, cake toppers, whipped cream shades, and custom lettering.',
    shortDescription: 'Tailored theme cake designed for birthdays, milestones, and parties.',
    image: '/images/Product_18.jpeg',
    gallery: ['/images/Product_18.jpeg', '/images/Product_10.jpeg'],
    isEggless: true,
    isAvailable: false, // Out of Stock demonstration
    shelfLife: '3 days refrigerated',
    allergens: ['Dairy', 'Gluten'],
    ingredients: ['Flour', 'Butter', 'Cream', 'Chocolate Ganache', 'Custom Elements'],
    weightOptions: ['2kg', '3kg'],
    minLeadTimeHours: 48,
    rating: 4.9,
    reviewCount: 28,
  },
]

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-cakes',
    name: 'Cakes',
    slug: 'Cakes',
    description: 'Freshly baked 100% eggless celebration cakes, chocolate ganache, fruit cakes, and signature sponges.',
    image: '/images/Product_1.jpeg',
    itemCount: 6,
  },
  {
    id: 'cat-custom',
    name: 'Customized Cakes',
    slug: 'Customized Cakes',
    description: 'Bespoke celebration bakes tailored to your themes, messages, tiers, and flavor choices.',
    image: '/images/Product_10.jpeg',
    itemCount: 5,
  },
  {
    id: 'cat-pastries',
    name: 'Pastries',
    slug: 'Pastries',
    description: 'Individual pastry slices, chocolate truffle brownies, and fruity layered delicacies.',
    image: '/images/Product_8.jpeg',
    itemCount: 3,
  },
  {
    id: 'cat-cupcakes',
    name: 'Cupcakes',
    slug: 'Cupcakes',
    description: 'Moist single-serve cupcakes topped with floral buttercream rosettes and molten lava cores.',
    image: '/images/Product_16.jpeg',
    itemCount: 2,
  },
  {
    id: 'cat-cookies',
    name: 'Cookies',
    slug: 'Cookies',
    description: 'Handcrafted golden butter cookies, cardamom biscuits, and tea-time crunchies.',
    image: '/images/Product_14.jpeg',
    itemCount: 1,
  },
  {
    id: 'cat-breads',
    name: 'Breads',
    slug: 'Breads',
    description: 'Slow-fermented artisan sourdough breads, herb focaccia, and fresh cottage loaves.',
    image: '/images/Product_15.jpeg',
    itemCount: 1,
  },
]

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products', {
        params: {
          ...(params?.category && params.category !== 'All' ? { category: params.category } : {}),
          ...(params?.search && params.search.trim() ? { search: params.search.trim() } : {}),
          ...(params?.minPrice !== undefined ? { minPrice: params.minPrice } : {}),
          ...(params?.maxPrice !== undefined ? { maxPrice: params.maxPrice } : {}),
          ...(params?.isEggless !== undefined ? { isEggless: params.isEggless } : {}),
          ...(params?.isAvailable !== undefined ? { isAvailable: params.isAvailable } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
        },
      })
      if (response.data && response.data.length > 0) {
        return response.data
      }
    } catch {
      // Fallback to local memory catalog if API request fails
    }

    // Fallback filtering
    let filtered = [...CLIENT_PRODUCTS]

    if (params?.category && params.category !== 'All') {
      const target = params.category.toLowerCase().trim()
      filtered = filtered.filter((p) => p.category.toLowerCase().trim() === target)
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      )
    }

    if (params?.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= params.minPrice!)
    }

    if (params?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= params.maxPrice!)
    }

    if (params?.isEggless !== undefined && params.isEggless) {
      filtered = filtered.filter((p) => p.isEggless)
    }

    if (params?.isAvailable !== undefined && params.isAvailable) {
      filtered = filtered.filter((p) => p.isAvailable)
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'newest':
          filtered.sort((a, b) => b.id.localeCompare(a.id))
          break
        case 'popular':
        default:
          filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
          break
      }
    }

    return filtered
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`)
      if (response.data) {
        return response.data
      }
    } catch {
      // Fallback
    }
    const item = CLIENT_PRODUCTS.find((p) => p.id === id)
    return item || null
  },

  async getCategories(): Promise<CategoryInfo[]> {
    try {
      const response = await apiClient.get<CategoryInfo[]>('/products/categories')
      if (response.data && response.data.length > 0) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return CATEGORIES
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/featured')
      if (response.data && response.data.length > 0) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return CLIENT_PRODUCTS.filter((p) => p.isFeatured)
  },

  async getBestSellers(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/bestsellers')
      if (response.data && response.data.length > 0) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return CLIENT_PRODUCTS.filter((p) => p.isBestseller)
  },
}
