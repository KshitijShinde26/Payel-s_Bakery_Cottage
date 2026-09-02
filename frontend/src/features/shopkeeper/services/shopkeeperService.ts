import { apiClient } from '@/lib/apiClient'
import type {
  Order,
  OrderStatus,
  CustomCakeRequest,
  CustomCakeStatus,
  UpdateOrderStatusPayload,
  ReviewCustomCakePayload,
} from '../types'

const SHOPKEEPER_ORDERS_STORAGE_KEY = 'payals_bakery_shopkeeper_orders'
const SHOPKEEPER_CAKES_STORAGE_KEY = 'payals_bakery_shopkeeper_custom_cakes'

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-8491',
    orderNumber: 'PBC-849101',
    userId: 'user-001',
    items: [
      {
        productId: 'prod-01',
        productName: 'Belgian Dark Chocolate Truffle Cake',
        productImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
        category: 'Cakes',
        weightOption: '1.0 kg',
        unitPrice: 950,
        quantity: 1,
        subtotal: 950,
      },
    ],
    subtotal: 950,
    deliveryChargeText: 'Free Local Delivery',
    grandTotal: 950,
    deliveryAddress: {
      id: 'addr-01',
      fullName: 'Ananya Sharma',
      phoneNumber: '+91 98765 43210',
      addressLine: 'Flat 402, Royal Palms, MG Road',
      areaLocality: 'Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      landmark: 'Near City Mall',
    },
    preferredDeliveryDate: '2026-08-22',
    preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
    paymentMethod: 'UPI_QR',
    orderStatus: 'PREPARING',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-8492',
    orderNumber: 'PBC-849102',
    userId: 'user-002',
    items: [
      {
        productId: 'prod-02',
        productName: 'Butter Almond Sourdough Loaf',
        productImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
        category: 'Artisanal Breads',
        weightOption: '500g',
        unitPrice: 280,
        quantity: 2,
        subtotal: 560,
      },
      {
        productId: 'prod-03',
        productName: 'Classic Butter French Croissants (Pack of 4)',
        productImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
        category: 'Pastries',
        weightOption: '4 Pcs',
        unitPrice: 320,
        quantity: 1,
        subtotal: 320,
      },
    ],
    subtotal: 880,
    deliveryChargeText: '₹40 Delivery Fee',
    grandTotal: 920,
    deliveryAddress: {
      id: 'addr-02',
      fullName: 'Rahul Mehta',
      phoneNumber: '+91 98220 11223',
      addressLine: 'Row House 12, Silver Oak Society',
      areaLocality: 'Baner',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
    },
    preferredDeliveryDate: '2026-08-22',
    preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
    paymentMethod: 'CASH_ON_DELIVERY',
    orderStatus: 'READY',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-8493',
    orderNumber: 'PBC-849103',
    userId: 'user-003',
    items: [
      {
        productId: 'prod-04',
        productName: 'Fresh Strawberry Cream Gateau',
        productImage: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60',
        category: 'Cakes',
        weightOption: '1.5 kg',
        unitPrice: 1350,
        quantity: 1,
        subtotal: 1350,
      },
    ],
    subtotal: 1350,
    deliveryChargeText: 'Free Local Delivery',
    grandTotal: 1350,
    deliveryAddress: {
      id: 'addr-03',
      fullName: 'Pooja Verma',
      phoneNumber: '+91 97654 32190',
      addressLine: 'Penthouse 9, Sky High Towers',
      areaLocality: 'Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411014',
      landmark: 'Opposite Symbiosis Campus',
    },
    preferredDeliveryDate: '2026-08-22',
    preferredDeliveryTime: 'Afternoon (01:00 PM – 05:00 PM)',
    paymentMethod: 'UPI_QR',
    orderStatus: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-8494',
    orderNumber: 'PBC-849104',
    userId: 'user-004',
    items: [
      {
        productId: 'prod-05',
        productName: 'Red Velvet Cream Cheese Jar (Set of 2)',
        productImage: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60',
        category: 'Dessert Jars',
        weightOption: '2 Jars',
        unitPrice: 380,
        quantity: 1,
        subtotal: 380,
      },
    ],
    subtotal: 380,
    deliveryChargeText: '₹30 Delivery Fee',
    grandTotal: 410,
    deliveryAddress: {
      id: 'addr-04',
      fullName: 'Siddharth Joshi',
      phoneNumber: '+91 99887 76655',
      addressLine: '14, Aundh Gaon Main Road',
      areaLocality: 'Aundh',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411007',
    },
    preferredDeliveryDate: '2026-08-22',
    preferredDeliveryTime: 'Morning (10:00 AM – 01:00 PM)',
    paymentMethod: 'UPI_QR',
    orderStatus: 'DELIVERED',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const INITIAL_MOCK_CUSTOM_CAKES: CustomCakeRequest[] = [
  {
    id: 'custom-cake-101',
    userId: 'user-101',
    cakeType: 'Birthday Cake',
    flavor: 'Chocolate Truffle',
    weight: '2.0 kg',
    dietaryPreference: 'Eggless',
    customMessage: 'Happy 5th Birthday Arav!',
    specialInstructions: 'Space and Galaxy theme, with fondant astronaut and edible gold stars on dark blue ganache base.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
    referenceImageName: 'galaxy_astronaut_cake_ref.jpg',
    referenceImageSize: 1024 * 1024 * 1.8,
    preferredDeliveryDate: '2026-08-24',
    preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
    status: 'PENDING_REVIEW',
    estimatedPrice: 2200,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'custom-cake-102',
    userId: 'user-102',
    cakeType: 'Anniversary Cake',
    flavor: 'Red Velvet',
    weight: '1.5 kg',
    dietaryPreference: 'With Egg',
    customMessage: '25 Years of Togetherness - Raj & Simran',
    specialInstructions: 'Semi-naked rustic design with fresh red roses and macaron garnishes on top.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
    referenceImageName: 'anniversary_rustic_roses.png',
    referenceImageSize: 1024 * 1024 * 2.4,
    preferredDeliveryDate: '2026-08-25',
    preferredDeliveryTime: 'Afternoon (01:00 PM – 05:00 PM)',
    status: 'UNDER_REVIEW',
    estimatedPrice: 1800,
    confirmedPrice: 1950,
    bakeryNotes: 'Fresh organic roses will be sourced and food-safe wrapped.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'custom-cake-103',
    userId: 'user-103',
    cakeType: 'Wedding Cake',
    flavor: 'Dutch Dark Chocolate',
    weight: '3.0 kg',
    dietaryPreference: 'Eggless',
    customMessage: 'Together Forever',
    specialInstructions: '3-tier floral cascading white wedding cake with subtle metallic rose gold accents.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&auto=format&fit=crop&q=80',
    referenceImageName: '3_tier_wedding_floral.jpg',
    referenceImageSize: 1024 * 1024 * 3.1,
    preferredDeliveryDate: '2026-08-28',
    preferredDeliveryTime: 'Morning (10:00 AM – 01:00 PM)',
    status: 'APPROVED',
    estimatedPrice: 3800,
    confirmedPrice: 4200,
    bakeryNotes: '3 tiers with dowel support system confirmed. Setup at venue included.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const shopkeeperService = {
  // --- ORDERS ---
  async getOrders(status?: OrderStatus): Promise<Order[]> {
    try {
      const url = status ? `/shopkeeper/orders?status=${status}` : '/shopkeeper/orders'
      const response = await apiClient.get<Order[]>(url)
      if (response.data && response.data.length > 0) {
        localStorage.setItem(SHOPKEEPER_ORDERS_STORAGE_KEY, JSON.stringify(response.data))
        return response.data
      }
    } catch {
      // Backend not running or offline: fallback to local cache or realistic initial mocks
    }

    const stored = localStorage.getItem(SHOPKEEPER_ORDERS_STORAGE_KEY)
    let list: Order[] = stored ? JSON.parse(stored) : INITIAL_MOCK_ORDERS
    if (status) {
      list = list.filter((o) => o.orderStatus === status)
    }
    return list
  },

  async updateOrderStatus(orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    try {
      const response = await apiClient.put<Order>(`/shopkeeper/orders/${orderId}/status`, payload)
      if (response.data) {
        this.updateLocalOrder(response.data)
        return response.data
      }
    } catch {
      // Offline fallback handling
    }

    const stored = localStorage.getItem(SHOPKEEPER_ORDERS_STORAGE_KEY)
    const list: Order[] = stored ? JSON.parse(stored) : INITIAL_MOCK_ORDERS
    const index = list.findIndex((o) => o.id === orderId || o.orderNumber === orderId)

    if (index === -1) {
      throw new Error(`Order #${orderId} not found.`)
    }

    const updated: Order = {
      ...list[index],
      orderStatus: payload.status,
      updatedAt: new Date().toISOString(),
    }

    if (payload.status === 'DELIVERED' && updated.paymentMethod === 'CASH_ON_DELIVERY') {
      updated.paymentStatus = 'PAID'
    }

    list[index] = updated
    localStorage.setItem(SHOPKEEPER_ORDERS_STORAGE_KEY, JSON.stringify(list))
    return updated
  },

  updateLocalOrder(updatedOrder: Order) {
    const stored = localStorage.getItem(SHOPKEEPER_ORDERS_STORAGE_KEY)
    const list: Order[] = stored ? JSON.parse(stored) : INITIAL_MOCK_ORDERS
    const index = list.findIndex((o) => o.id === updatedOrder.id)
    if (index !== -1) {
      list[index] = updatedOrder
    } else {
      list.unshift(updatedOrder)
    }
    localStorage.setItem(SHOPKEEPER_ORDERS_STORAGE_KEY, JSON.stringify(list))
  },

  // --- CUSTOM CAKES ---
  async getCustomCakes(status?: CustomCakeStatus): Promise<CustomCakeRequest[]> {
    try {
      const url = status ? `/shopkeeper/custom-cakes?status=${status}` : '/shopkeeper/custom-cakes'
      const response = await apiClient.get<CustomCakeRequest[]>(url)
      if (response.data && response.data.length > 0) {
        localStorage.setItem(SHOPKEEPER_CAKES_STORAGE_KEY, JSON.stringify(response.data))
        return response.data
      }
    } catch {
      // Backend not running or offline: fallback to local cache or realistic initial mocks
    }

    const stored = localStorage.getItem(SHOPKEEPER_CAKES_STORAGE_KEY)
    let list: CustomCakeRequest[] = stored ? JSON.parse(stored) : INITIAL_MOCK_CUSTOM_CAKES
    if (status) {
      list = list.filter((c) => c.status === status)
    }
    return list
  },

  async reviewCustomCake(id: string, payload: ReviewCustomCakePayload): Promise<CustomCakeRequest> {
    try {
      const response = await apiClient.put<CustomCakeRequest>(`/shopkeeper/custom-cakes/${id}/review`, payload)
      if (response.data) {
        this.updateLocalCustomCake(response.data)
        return response.data
      }
    } catch {
      // Offline fallback handling
    }

    const stored = localStorage.getItem(SHOPKEEPER_CAKES_STORAGE_KEY)
    const list: CustomCakeRequest[] = stored ? JSON.parse(stored) : INITIAL_MOCK_CUSTOM_CAKES
    const index = list.findIndex((c) => c.id === id)

    if (index === -1) {
      throw new Error(`Custom Cake request #${id} not found.`)
    }

    const updated: CustomCakeRequest = {
      ...list[index],
      status: payload.status,
      confirmedPrice: payload.confirmedPrice ?? list[index].confirmedPrice ?? list[index].estimatedPrice,
      estimatedPrice: payload.estimatedPrice ?? list[index].estimatedPrice,
      bakeryNotes: payload.bakeryNotes ?? list[index].bakeryNotes,
      updatedAt: new Date().toISOString(),
    }

    list[index] = updated
    localStorage.setItem(SHOPKEEPER_CAKES_STORAGE_KEY, JSON.stringify(list))
    return updated
  },

  updateLocalCustomCake(updatedCake: CustomCakeRequest) {
    const stored = localStorage.getItem(SHOPKEEPER_CAKES_STORAGE_KEY)
    const list: CustomCakeRequest[] = stored ? JSON.parse(stored) : INITIAL_MOCK_CUSTOM_CAKES
    const index = list.findIndex((c) => c.id === updatedCake.id)
    if (index !== -1) {
      list[index] = updatedCake
    } else {
      list.unshift(updatedCake)
    }
    localStorage.setItem(SHOPKEEPER_CAKES_STORAGE_KEY, JSON.stringify(list))
  },
}
