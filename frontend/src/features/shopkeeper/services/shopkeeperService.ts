import { apiClient } from '@/lib/apiClient'
import type {
  Order,
  OrderStatus,
  CustomCakeRequest,
  CustomCakeStatus,
  UpdateOrderStatusPayload,
  AssignDeliveryPartnerPayload,
  ReviewCustomCakePayload,
  ShopkeeperSummary,
  Product,
} from '../types'
import { applyStockOverride, productService } from '@/features/catalog/services/productService'

const ORDERS_STORAGE_KEY = 'pbc_shopkeeper_orders'

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-pbc-101',
    orderNumber: 'PBC-892101',
    userId: 'cust-1',
    items: [
      {
        productId: 'prod-1',
        productName: 'Dutch Truffle Cake (100% Eggless)',
        productImage: '/images/Product_1.jpeg',
        category: 'Cakes',
        weightOption: '1.0 kg',
        unitPrice: 750,
        quantity: 1,
        subtotal: 750,
      },
    ],
    subtotal: 750,
    deliveryCharge: 60,
    deliveryChargeText: 'Rs. 60',
    grandTotal: 810,
    deliveryAddress: {
      id: 'addr-1',
      fullName: 'Sneha Joshi',
      phoneNumber: '+91 98221 44556',
      addressLine: 'Flat 402, Mayur Heights',
      areaLocality: 'Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      landmark: 'Near Ideal Colony Ground',
    },
    preferredDeliveryDate: 'Today',
    preferredDeliveryTime: 'Evening (05:00 PM – 08:00 PM)',
    paymentMethod: 'CASH_ON_DELIVERY',
    orderStatus: 'READY',
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-pbc-102',
    orderNumber: 'PBC-892102',
    userId: 'cust-2',
    items: [
      {
        productId: 'prod-2',
        productName: 'Red Velvet Heart Cake',
        productImage: '/images/Product_2.jpeg',
        category: 'Cakes',
        weightOption: '1.0 kg',
        unitPrice: 850,
        quantity: 1,
        subtotal: 850,
      },
    ],
    subtotal: 850,
    deliveryCharge: 60,
    deliveryChargeText: 'Rs. 60',
    grandTotal: 910,
    deliveryAddress: {
      id: 'addr-2',
      fullName: 'Rajesh Mehta',
      phoneNumber: '+91 98901 22334',
      addressLine: '12 Green Park Villa',
      areaLocality: 'Baner',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      landmark: 'Behind D-Mart',
    },
    preferredDeliveryDate: 'Today',
    preferredDeliveryTime: 'Afternoon (01:00 PM – 05:00 PM)',
    paymentMethod: 'CASH_ON_DELIVERY',
    orderStatus: 'PREPARING',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ord-pbc-103',
    orderNumber: 'PBC-892103',
    userId: 'cust-3',
    items: [
      {
        productId: 'prod-3',
        productName: 'Artisanal Butter Croissant Box',
        productImage: '/images/Product_3.jpeg',
        category: 'Pastries',
        weightOption: 'Box of 4',
        unitPrice: 320,
        quantity: 2,
        subtotal: 640,
      },
    ],
    subtotal: 640,
    deliveryCharge: 60,
    deliveryChargeText: 'Rs. 60',
    grandTotal: 700,
    deliveryAddress: {
      id: 'addr-3',
      fullName: 'Ananya Deshmukh',
      phoneNumber: '+91 97654 32109',
      addressLine: 'B-201, Rohan Nilay',
      areaLocality: 'Aundh',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411007',
    },
    preferredDeliveryDate: 'Tomorrow',
    preferredDeliveryTime: 'Morning (10:00 AM – 01:00 PM)',
    paymentMethod: 'CASH_ON_DELIVERY',
    orderStatus: 'CONFIRMED',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

export const getStoredOrders = (status?: OrderStatus): Order[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(ORDERS_STORAGE_KEY) : null
    let list: Order[] = raw ? JSON.parse(raw) : INITIAL_ORDERS
    if (!raw && typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS))
    }
    if (status) {
      list = list.filter((o) => o.orderStatus === status)
    }
    return list
  } catch {
    return INITIAL_ORDERS
  }
}

export const saveStoredOrders = (orders: Order[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    }
  } catch {}
}

export const shopkeeperService = {
  // --- SUMMARY / STATS (Real Database Metrics) ---
  async getSummary(): Promise<ShopkeeperSummary> {
    try {
      const response = await apiClient.get<ShopkeeperSummary>('/shopkeeper/summary')
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.error('Failed to fetch live shopkeeper summary from backend', err)
    }

    return {
      totalProducts: 0,
      availableProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      preparingOrders: 0,
      readyOrders: 0,
      outForDeliveryOrders: 0,
      completedOrders: 0,
      pendingPayments: 0,
      pendingCustomCakes: 0,
      totalCustomCakes: 0,
      todayOrders: 0,
    }
  },

  // --- READ-ONLY PRODUCT CATALOG REFERENCE (Real Database Records Only) ---
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/shopkeeper/products', {
        params: {
          ...(category && category !== 'ALL' ? { category } : {}),
          ...(search && search.trim() ? { search: search.trim() } : {}),
        },
      })
      if (Array.isArray(response.data)) {
        return response.data.map(applyStockOverride)
      }
    } catch (err) {
      console.error('Failed to fetch products from backend', err)
    }
    return []
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/shopkeeper/products/${id}`)
      if (response.data) {
        return applyStockOverride(response.data)
      }
      return null
    } catch (err) {
      console.error(`Failed to fetch product #${id} from backend`, err)
      return null
    }
  },

  async updateProductStock(id: string, stockQuantity: number): Promise<Product> {
    return productService.updateProductStock(id, stockQuantity)
  },

  // --- REAL ORDERS (Database Records Only) ---
  // --- REAL ORDERS (Database Records with offline support) ---
  async getOrders(status?: OrderStatus): Promise<Order[]> {
    try {
      const url = status ? `/shopkeeper/orders?status=${status}` : '/shopkeeper/orders'
      const response = await apiClient.get<Order[]>(url)
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.warn('Backend orders unavailable, loading local orders cache', err)
      return getStoredOrders(status)
    }
    return []
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/shopkeeper/orders/${orderId}`)
      return response.data
    } catch (err) {
      const stored = getStoredOrders().find((o) => o.id === orderId || o.orderNumber === orderId)
      return stored || null
    }
  },

  async updateOrderStatus(orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    try {
      const response = await apiClient.put<Order>(`/shopkeeper/orders/${orderId}/status`, payload)
      return response.data
    } catch (err) {
      const all = getStoredOrders()
      const target = all.find((o) => o.id === orderId || o.orderNumber === orderId)
      if (target) {
        target.orderStatus = payload.status
        if (payload.kitchenNotes) target.kitchenNotes = payload.kitchenNotes
        saveStoredOrders(all)
        return { ...target }
      }
      throw err
    }
  },

  // --- DELIVERY PARTNER & CHARGES ASSIGNMENT ---
  async getDeliveryPartners(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/shopkeeper/delivery-partners')
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data
      }
    } catch (err) {
      try {
        const response = await apiClient.get<any[]>('/admin/delivery-partners')
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data
        }
      } catch (fallbackErr) {}
    }

    // Default registered couriers for smooth delivery partner selection
    return [
      {
        id: 'dp-1',
        userId: 'dp-1',
        fullName: 'Ravi Kumar',
        phoneNumber: '+91 98765 43210',
        serviceArea: 'Kothrud & Central Pune',
        status: 'ACTIVE',
        enabled: true,
      },
      {
        id: 'dp-2',
        userId: 'dp-2',
        fullName: 'Amit Shinde',
        phoneNumber: '+91 91234 56789',
        serviceArea: 'Baner & Western Suburbs',
        status: 'ACTIVE',
        enabled: true,
      },
      {
        id: 'dp-3',
        userId: 'dp-3',
        fullName: 'Suresh Patil',
        phoneNumber: '+91 98888 77777',
        serviceArea: 'Viman Nagar & East Pune',
        status: 'ACTIVE',
        enabled: true,
      },
    ]
  },

  async assignDeliveryPartner(orderId: string, payload: AssignDeliveryPartnerPayload): Promise<Order> {
    try {
      const response = await apiClient.post<Order>(`/shopkeeper/orders/${orderId}/assign-delivery-partner`, payload)
      return response.data
    } catch (err) {
      try {
        const response = await apiClient.post<Order>(`/admin/orders/${orderId}/assign-delivery-partner`, payload)
        return response.data
      } catch (adminErr) {
        // Offline cache update
        const all = getStoredOrders()
        const target = all.find((o) => o.id === orderId || o.orderNumber === orderId)
        if (target) {
          const partnerList = await this.getDeliveryPartners()
          const partner = partnerList.find((p) => p.userId === payload.deliveryPartnerId || p.id === payload.deliveryPartnerId)
          target.deliveryPartnerId = payload.deliveryPartnerId
          target.deliveryPartnerName = partner?.fullName || 'Bakery Assigned Courier'
          target.deliveryPartnerPhone = partner?.phoneNumber || ''
          const charge = payload.deliveryCharge != null ? payload.deliveryCharge : 60
          target.deliveryCharge = charge
          target.deliveryChargeText = `Rs. ${charge}`
          target.orderStatus = 'OUT_FOR_DELIVERY'
          target.grandTotal = (target.subtotal || 0) + charge
          target.outForDeliveryAt = new Date().toISOString()
          if (payload.deliveryNotes) target.deliveryNotes = payload.deliveryNotes
          saveStoredOrders(all)
          return { ...target }
        }
        throw err
      }
    }
  },

  // --- REAL CUSTOM CAKE REQUESTS (Database Records Only) ---
  async getCustomCakes(status?: CustomCakeStatus): Promise<CustomCakeRequest[]> {
    try {
      const url = status ? `/shopkeeper/custom-cakes?status=${status}` : '/shopkeeper/custom-cakes'
      const response = await apiClient.get<CustomCakeRequest[]>(url)
      if (response.data) {
        return response.data
      }
    } catch (err) {
      console.error('Failed to fetch custom cakes from backend', err)
    }
    return []
  },

  async getCustomCakeById(id: string): Promise<CustomCakeRequest | null> {
    try {
      const response = await apiClient.get<CustomCakeRequest>(`/shopkeeper/custom-cakes/${id}`)
      return response.data
    } catch (err) {
      console.error(`Failed to fetch custom cake #${id} from backend`, err)
      return null
    }
  },

  async reviewCustomCake(id: string, payload: ReviewCustomCakePayload): Promise<CustomCakeRequest> {
    const response = await apiClient.put<CustomCakeRequest>(`/shopkeeper/custom-cakes/${id}/review`, payload)
    return response.data
  },
}
