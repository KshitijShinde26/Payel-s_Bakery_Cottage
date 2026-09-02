import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { adminService } from '@/features/admin/services/adminService'
import { productService, CATEGORIES } from '@/features/catalog/services/productService'
import type { Product, CategoryInfo, ProductCategory } from '@/features/catalog/types'
import type {
  AdminSummary,
  AdminUser,
  AuditLog,
  Order,
  OrderStatus,
  CustomCakeRequest,
  CustomCakeStatus,
  FeasibilityDecision,
} from '@/features/admin/types'
import toast from 'react-hot-toast'
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  IndianRupee,
  CreditCard,
  Clock,
  Cake,
  FolderTree,
  FileBarChart2,
  Settings,
  Boxes,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  Phone,
  X,
  Mail,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Upload,
  Check,
} from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  // Active Tab
  type TabType = 'overview' | 'users' | 'orders' | 'custom_cakes' | 'products' | 'categories' | 'audit' | 'settings'
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Main Data States
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [ordersList, setOrdersList] = useState<Order[]>([])
  const [cakesList, setCakesList] = useState<CustomCakeRequest[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [productsList, setProductsList] = useState<Product[]>([])
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>(CATEGORIES)

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Filters & Search States
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [cakeStatusFilter, setCakeStatusFilter] = useState<string>('ALL')
  const [auditEventFilter, setAuditEventFilter] = useState<string>('ALL')
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL')

  // Modals States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCake, setSelectedCake] = useState<CustomCakeRequest | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)
  const [statusConfirmUser, setStatusConfirmUser] = useState<AdminUser | null>(null)

  // Product Management Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false)

  // Product Form State
  const initialProductForm = {
    name: '',
    category: 'Cakes' as ProductCategory,
    price: 500,
    originalPrice: '' as number | '',
    description: '',
    shortDescription: '',
    image: '/images/Product_1.jpeg',
    isEggless: true,
    isAvailable: true,
    isBestseller: false,
    isFeatured: false,
    shelfLife: '3–4 days refrigerated',
    weightOptions: '500g, 1kg, 1.5kg',
    minLeadTimeHours: 24,
  }
  const [productForm, setProductForm] = useState(initialProductForm)

  // Review Custom Cake Form State
  const [cakeReviewForm, setCakeReviewForm] = useState<{
    status: CustomCakeStatus
    confirmedPrice: number
    feasibilityDecision: FeasibilityDecision
    bakeryNotes: string
  }>({
    status: 'APPROVED',
    confirmedPrice: 0,
    feasibilityDecision: 'FEASIBLE',
    bakeryNotes: '',
  })

  // Synchronize hash with active tab
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase()
    if (hash === 'users' || hash === 'customers' || hash === 'shopkeepers') {
      setActiveTab('users')
    } else if (hash === 'orders' || hash === 'all_orders') {
      setActiveTab('orders')
    } else if (hash === 'custom-cakes' || hash === 'custom_cakes' || hash === 'cakes') {
      setActiveTab('custom_cakes')
    } else if (hash === 'products' || hash === 'catalogue') {
      setActiveTab('products')
    } else if (hash === 'categories') {
      setActiveTab('categories')
    } else if (hash === 'audit' || hash === 'reports' || hash === 'logs') {
      setActiveTab('audit')
    } else if (hash === 'settings' || hash === 'hours' || hash === 'holidays') {
      setActiveTab('settings')
    } else {
      setActiveTab('overview')
    }
  }, [location.hash])

  // Load all admin live data
  const fetchAllAdminData = async () => {
    try {
      const [summaryRes, usersRes, ordersRes, cakesRes, logsRes, prodRes, catRes] = await Promise.all([
        adminService.getSummary().catch(() => null),
        adminService.getUsers().catch(() => []),
        adminService.getOrders().catch(() => []),
        adminService.getCustomCakes().catch(() => []),
        adminService.getAuditLogs().catch(() => []),
        adminService.getAdminProducts().catch(() => productService.getProducts()),
        productService.getCategories().catch(() => CATEGORIES),
      ])

      if (summaryRes) setSummary(summaryRes)
      setUsersList(usersRes)
      setOrdersList(ordersRes)
      setCakesList(cakesRes)
      setAuditLogs(logsRes)
      setProductsList(prodRes)
      setCategoriesList(catRes)
    } catch (err) {
      console.error('Failed to load admin data', err)
      toast.error('Failed to sync live admin dashboard.')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    document.title = "Central Admin Console | Payal's Bakery Cottage"
    fetchAllAdminData()
  }, [])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchAllAdminData()
    toast.success('Live bakery telemetry refreshed!')
  }

  // Toggle user account enabled status
  const handleToggleUserStatus = async (userToUpdate: AdminUser) => {
    const newStatus = !(userToUpdate.enabled !== false)
    try {
      const updated = await adminService.updateUserStatus(userToUpdate.id, newStatus)
      setUsersList((prev) => prev.map((u) => (u.id === userToUpdate.id ? updated : u)))
      setStatusConfirmUser(null)
      toast.success(`User ${userToUpdate.fullName} account has been ${newStatus ? 'enabled' : 'disabled'}.`)
      const summaryRes = await adminService.getSummary().catch(() => null)
      if (summaryRes) setSummary(summaryRes)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status.')
    }
  }

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await adminService.updateOrderStatus(orderId, { status: newStatus })
      setOrdersList((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated)
      }
      toast.success(`Order #${updated.orderNumber} transitioned to ${newStatus.replace(/_/g, ' ')}!`)
      const summaryRes = await adminService.getSummary().catch(() => null)
      if (summaryRes) setSummary(summaryRes)
    } catch {
      toast.error('Failed to update order status.')
    }
  }

  // Open Custom Cake Review
  const handleOpenCakeReview = (cake: CustomCakeRequest) => {
    setSelectedCake(cake)
    setCakeReviewForm({
      status: cake.status === 'PENDING_REVIEW' ? 'APPROVED' : cake.status,
      confirmedPrice: cake.confirmedPrice || cake.estimatedPrice || 1200,
      feasibilityDecision: 'FEASIBLE',
      bakeryNotes: cake.bakeryNotes || 'Approved by Executive Chef. Ready for kitchen preparation.',
    })
  }

  // Submit Cake Review
  const handleSubmitCakeReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCake) return

    try {
      const updated = await adminService.reviewCustomCake(selectedCake.id, {
        status: cakeReviewForm.status,
        confirmedPrice: Number(cakeReviewForm.confirmedPrice),
        estimatedPrice: selectedCake.estimatedPrice,
        feasibilityDecision: cakeReviewForm.feasibilityDecision,
        bakeryNotes: cakeReviewForm.bakeryNotes,
      })

      setCakesList((prev) => prev.map((c) => (c.id === selectedCake.id ? updated : c)))
      setSelectedCake(null)
      toast.success(`Custom cake request #${selectedCake.id.slice(-6)} updated!`)
      const summaryRes = await adminService.getSummary().catch(() => null)
      if (summaryRes) setSummary(summaryRes)
    } catch {
      toast.error('Failed to update custom cake request.')
    }
  }

  // ==========================================
  // PRODUCT MANAGEMENT HANDLERS
  // ==========================================

  const handleOpenAddProduct = () => {
    setProductForm(initialProductForm)
    setIsAddProductOpen(true)
  }

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod)
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      description: prod.description,
      shortDescription: prod.shortDescription || '',
      image: prod.image,
      isEggless: prod.isEggless,
      isAvailable: prod.isAvailable,
      isBestseller: prod.isBestseller || false,
      isFeatured: prod.isFeatured || false,
      shelfLife: prod.shelfLife || '3–4 days refrigerated',
      weightOptions: prod.weightOptions ? prod.weightOptions.join(', ') : '500g, 1kg, 1.5kg',
      minLeadTimeHours: prod.minLeadTimeHours || 24,
    })
  }

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const url = await adminService.uploadProductImage(file)
      setProductForm((prev) => ({ ...prev, image: url }))
      toast.success('Product image uploaded successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload product image to Cloudinary.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingProduct(true)

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice !== '' ? Number(productForm.originalPrice) : undefined,
      description: productForm.description.trim(),
      shortDescription: productForm.shortDescription.trim() || productForm.description.substring(0, 100),
      image: productForm.image,
      isEggless: productForm.isEggless,
      isAvailable: productForm.isAvailable,
      isBestseller: productForm.isBestseller,
      isFeatured: productForm.isFeatured,
      shelfLife: productForm.shelfLife,
      weightOptions: productForm.weightOptions.split(',').map((w) => w.trim()).filter(Boolean),
      minLeadTimeHours: Number(productForm.minLeadTimeHours),
    }

    try {
      if (editingProduct) {
        const updated = await adminService.updateProduct(editingProduct.id, payload)
        setProductsList((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)))
        setEditingProduct(null)
        toast.success(`Product "${updated.name}" updated successfully!`)
      } else {
        const created = await adminService.createProduct(payload)
        setProductsList((prev) => [created, ...prev])
        setIsAddProductOpen(false)
        toast.success(`New product "${created.name}" created!`)
      }
      // Refresh dynamic categories
      const catRes = await productService.getCategories().catch(() => CATEGORIES)
      setCategoriesList(catRes)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product.')
    } finally {
      setIsSubmittingProduct(false)
    }
  }

  const handleToggleProductAvailability = async (prod: Product) => {
    const newStatus = !prod.isAvailable
    try {
      const updated = await adminService.toggleProductAvailability(prod.id, newStatus)
      setProductsList((prev) => prev.map((p) => (p.id === prod.id ? updated : p)))
      toast.success(`Product "${prod.name}" marked as ${newStatus ? 'Available' : 'Out of Stock'}.`)
    } catch {
      toast.error('Failed to change product availability.')
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return

    try {
      await adminService.deleteProduct(deleteConfirmProduct.id)
      setProductsList((prev) => prev.filter((p) => p.id !== deleteConfirmProduct.id))
      setDeleteConfirmProduct(null)
      toast.success(`Product "${deleteConfirmProduct.name}" safely removed from catalogue.`)
      const catRes = await productService.getCategories().catch(() => CATEGORIES)
      setCategoriesList(catRes)
    } catch {
      toast.error('Failed to delete product.')
    }
  }

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(q) ||
        u.role.toLowerCase().includes(q)
      return matchesRole && matchesSearch
    })
  }, [usersList, userRoleFilter, searchQuery])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const matchesStatus = orderStatusFilter === 'ALL' || order.orderStatus === orderStatusFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.deliveryAddress?.fullName?.toLowerCase().includes(q) ||
        order.items.some((i) => i.productName.toLowerCase().includes(q))
      return matchesStatus && matchesSearch
    })
  }, [ordersList, orderStatusFilter, searchQuery])

  // Filtered Custom Cakes
  const filteredCakes = useMemo(() => {
    return cakesList.filter((cake) => {
      const matchesStatus = cakeStatusFilter === 'ALL' || cake.status === cakeStatusFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        cake.cakeType.toLowerCase().includes(q) ||
        cake.flavor.toLowerCase().includes(q) ||
        cake.customMessage?.toLowerCase().includes(q) ||
        cake.id.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [cakesList, cakeStatusFilter, searchQuery])

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesEvent = auditEventFilter === 'ALL' || log.eventType === auditEventFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        log.email.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q) ||
        log.ipAddress?.includes(q) ||
        log.details?.toLowerCase().includes(q)
      return matchesEvent && matchesSearch
    })
  }, [auditLogs, auditEventFilter, searchQuery])

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesCat = productCategoryFilter === 'ALL' || p.category.toLowerCase() === productCategoryFilter.toLowerCase()
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [productsList, productCategoryFilter, searchQuery])

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-red-950 text-white p-6 sm:p-8 md:p-10 shadow-2xl border border-stone-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold mb-3 border border-red-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>Central Administration Console • Real-Time Database Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Executive: {user?.fullName || 'System Administrator'}
            </h1>
            <p className="mt-2 text-stone-300 text-sm leading-relaxed">
              Full administrative authority over product catalogue, platform orders, user access permissions, custom cakes, and revenue settlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Administrative Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'overview' as const, label: 'Executive Overview', icon: LayoutDashboard, hash: '#overview' },
            { id: 'products' as const, label: 'Products Master', icon: Boxes, hash: '#products', count: productsList.length },
            { id: 'orders' as const, label: 'Orders Central', icon: ShoppingBag, hash: '#orders', count: ordersList.length },
            { id: 'custom_cakes' as const, label: 'Custom Cakes', icon: Cake, hash: '#custom-cakes', count: summary?.pendingCustomCakes },
            { id: 'users' as const, label: 'Users & Roles', icon: Users, hash: '#users', count: usersList.length },
            { id: 'categories' as const, label: 'Categories', icon: FolderTree, hash: '#categories', count: categoriesList.length },
            { id: 'audit' as const, label: 'Security & Audit', icon: FileBarChart2, hash: '#audit', count: auditLogs.length },
            { id: 'settings' as const, label: 'Bakery Settings', icon: Settings, hash: '#settings' },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  window.location.hash = tab.hash
                  setSearchQuery('')
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-amber-50 hover:text-amber-900 border border-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search Field */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTab.replace('_', ' ')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Live Primary Financial & Volume KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: "Today's Bakery Revenue",
                value: `₹${(summary?.todayRevenue ?? 0).toFixed(2)}`,
                desc: 'Real-time sales today',
                icon: IndianRupee,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Monthly Gross Revenue',
                value: `₹${(summary?.monthlyRevenue ?? summary?.totalRevenue ?? 0).toFixed(2)}`,
                desc: 'Current calendar month',
                icon: IndianRupee,
                color: 'text-amber-700',
                bg: 'bg-amber-50',
              },
              {
                label: 'Total Platform Orders',
                value: summary?.totalOrders ?? ordersList.length,
                desc: `${summary?.pendingOrders ?? 0} in active pipeline`,
                icon: ShoppingBag,
                color: 'text-blue-700',
                bg: 'bg-blue-50',
              },
              {
                label: 'Bakery Products in Store',
                value: productsList.length,
                desc: `${productsList.filter((p) => p.isAvailable).length} available for order`,
                icon: Boxes,
                color: 'text-purple-700',
                bg: 'bg-purple-50',
              },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-stone-900 mt-1 font-serif">{stat.value}</p>
                    <span className="text-[11px] font-semibold text-stone-500 mt-1 block">{stat.desc}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* User Breakdown & Pipeline Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Registered Customers',
                value: summary?.totalCustomers ?? usersList.filter((u) => u.role === 'CUSTOMER').length,
                icon: Users,
                desc: 'Bakery patrons',
              },
              {
                label: 'Active Shopkeepers',
                value: summary?.totalShopkeepers ?? usersList.filter((u) => u.role === 'SHOPKEEPER').length,
                icon: Store,
                desc: 'Kitchen & store team',
              },
              {
                label: 'Pending Custom Cakes',
                value: summary?.pendingCustomCakes ?? 0,
                icon: Cake,
                desc: 'Inquiries awaiting quote',
              },
              {
                label: 'Completed Orders',
                value: summary?.completedOrders ?? 0,
                icon: CheckCircle2,
                desc: 'Delivered & closed',
              },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-400 mb-2">
                    <Icon className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-medium text-stone-600 truncate">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold font-serif text-stone-900">{stat.value}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{stat.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Dynamic 7-Day Revenue & Sales Analytics Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">7-Day Revenue & Sales Telemetry</h2>
                  <p className="text-xs text-stone-500">Live order values recorded in the bakery database over the last week</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Live Sync
                </span>
              </div>

              {/* Dynamic Chart Bars */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                {(summary?.weeklySales && summary.weeklySales.length > 0
                  ? summary.weeklySales
                  : [
                      { day: 'Mon', amount: 0, orderCount: 0 },
                      { day: 'Tue', amount: 0, orderCount: 0 },
                      { day: 'Wed', amount: 0, orderCount: 0 },
                      { day: 'Thu', amount: 0, orderCount: 0 },
                      { day: 'Fri', amount: 0, orderCount: 0 },
                      { day: 'Sat', amount: 0, orderCount: 0 },
                      { day: 'Sun', amount: 0, orderCount: 0 },
                    ]
                ).map((dayData, idx) => {
                  const maxAmount = Math.max(
                    ...(summary?.weeklySales?.map((s) => s.amount) || [1000]),
                    1000
                  )
                  const heightPercent = Math.max(Math.min((dayData.amount / maxAmount) * 100, 100), 8)

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono text-stone-600 font-semibold group-hover:text-amber-800 transition-colors">
                        ₹{dayData.amount.toFixed(0)}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[42px] bg-gradient-to-t from-red-800 via-amber-600 to-amber-500 rounded-t-xl transition-all group-hover:brightness-110 shadow-xs"
                        title={`${dayData.day}: ₹${dayData.amount.toFixed(2)} (${dayData.orderCount} orders)`}
                      />
                      <span className="text-xs font-medium text-stone-600">{dayData.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* System Health & Security Logs Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Platform Health & Security</span>
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Database Products Engine</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{productsList.length} Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Cloudinary Asset Storage</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Spring Security & JWT</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Strict RBAC</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Security Audit Logs</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{auditLogs.length} Events</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#products'
                    setActiveTab('products')
                  }}
                  className="w-full text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center justify-between cursor-pointer"
                >
                  <span>Manage Products Master</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCTS & CATALOGUE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">Bakery Product Master & Inventory</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Total {filteredProducts.length} items found. All edits synchronize directly with Customer storefront.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setProductCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    productCategoryFilter === 'ALL'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  All Categories
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setProductCategoryFilter(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      productCategoryFilter === cat.name
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {/* Products Grid with Complete Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-stone-200 hover:border-amber-400 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-stone-100">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {prod.isEggless && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                          100% Eggless
                        </span>
                      )}
                      {prod.isBestseller && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          Bestseller
                        </span>
                      )}
                      {prod.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                          prod.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.isAvailable ? 'Active' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{prod.name}</h3>
                  <span className="text-[11px] text-amber-800 font-semibold block">{prod.category}</span>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{prod.shortDescription || prod.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-serif font-bold text-stone-900">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-xs text-stone-400 line-through ml-1.5">₹{prod.originalPrice}</span>
                      )}
                    </div>
                    {/* Availability Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleProductAvailability(prod)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl cursor-pointer transition-colors ${
                        prod.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                      title="Click to toggle availability"
                    >
                      {prod.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>

                  {/* Actions (Edit & Delete) */}
                  <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(prod)}
                      className="flex-1 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmProduct(prod)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors"
                      title="Delete / Archive Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
              <Boxes className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold font-serif text-stone-800">No products match criteria</h3>
              <p className="text-xs text-stone-500 mt-1">Try resetting the category filter or searching a different keyword.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS CENTRAL */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">Orders Central Dashboard</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Total {filteredOrders.length} orders matching current criteria
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'CONFIRMED', label: 'Confirmed' },
                { id: 'PREPARING', label: 'Baking / Prep' },
                { id: 'READY', label: 'Ready' },
                { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                { id: 'DELIVERED', label: 'Delivered' },
                { id: 'CANCELLED', label: 'Cancelled' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    orderStatusFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Order #</th>
                  <th className="px-5 py-3.5 font-bold">Customer</th>
                  <th className="px-5 py-3.5 font-bold">Items</th>
                  <th className="px-5 py-3.5 font-bold">Total</th>
                  <th className="px-5 py-3.5 font-bold">Payment</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-stone-900 block">{order.orderNumber}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-stone-800 block">
                        {order.deliveryAddress?.fullName || 'Valued Customer'}
                      </span>
                      <span className="text-[11px] text-stone-500">{order.deliveryAddress?.phoneNumber}</span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-stone-800 block">{order.items.length} Bakery Item(s)</span>
                      <span className="text-[10px] text-stone-500 truncate max-w-[160px] block">
                        {order.items.map((i) => i.productName).join(', ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-serif font-bold text-stone-900 text-sm">
                        ₹{order.grandTotal.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-stone-400 block">{order.paymentMethod.replace(/_/g, ' ')}</span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : order.orderStatus === 'PREPARING'
                            ? 'bg-orange-50 text-orange-800 border-orange-200'
                            : order.orderStatus === 'READY'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : order.orderStatus === 'OUT_FOR_DELIVERY'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center text-stone-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-semibold">No orders match the search criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOM CAKE REQUESTS OVERSIGHT */}
      {/* ========================================================================= */}
      {activeTab === 'custom_cakes' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">Custom Cake Requests & Quotes</h2>
              <p className="text-xs text-stone-500">Review customer design inquiries and validate pricing quotes</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Requests' },
                { id: 'PENDING_REVIEW', label: 'Pending Review' },
                { id: 'UNDER_REVIEW', label: 'Under Review' },
                { id: 'APPROVED', label: 'Approved & Quoted' },
                { id: 'REJECTED', label: 'Declined' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCakeStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    cakeStatusFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredCakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCakes.map((cake) => (
                <div
                  key={cake.id}
                  className="bg-white rounded-3xl border border-stone-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative rounded-2xl overflow-hidden mb-4 bg-stone-100 aspect-video group">
                      {cake.referenceImageUrl ? (
                        <>
                          <img
                            src={cake.referenceImageUrl}
                            alt={cake.cakeType}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: cake.referenceImageUrl, title: `${cake.cakeType} Reference` })}
                            className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs transition-opacity cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Full Photo</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                          <Cake className="w-8 h-8 mb-1" />
                          <span className="text-[11px]">No Reference Photo</span>
                        </div>
                      )}

                      <div className="absolute top-2 left-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs bg-white text-stone-800">
                          {cake.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-serif font-bold text-stone-900">{cake.cakeType}</h3>
                          <p className="text-xs text-amber-800 font-semibold">{cake.flavor}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-stone-900 font-serif">
                            ₹{(cake.confirmedPrice || cake.estimatedPrice || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            {cake.confirmedPrice ? 'Confirmed Quote' : 'Est. Price'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <div>
                          <span className="text-stone-400 block text-[9px] uppercase font-bold">Weight</span>
                          <span className="font-bold text-stone-800">{cake.weight}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px] uppercase font-bold">Dietary</span>
                          <span className="font-bold text-stone-800">{cake.dietaryPreference}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-stone-400 block text-[9px] uppercase font-bold">Target Delivery</span>
                          <span className="font-semibold text-stone-700">
                            {cake.preferredDeliveryDate} • {cake.preferredDeliveryTime}
                          </span>
                        </div>
                      </div>

                      {cake.customMessage && (
                        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                          <span className="text-[10px] font-bold uppercase text-amber-900 block">Message on Cake:</span>
                          <p className="italic text-stone-700 mt-0.5">"{cake.customMessage}"</p>
                        </div>
                      )}

                      {cake.specialInstructions && (
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                          <span className="font-semibold text-stone-800">Customer Note: </span>
                          {cake.specialInstructions}
                        </p>
                      )}

                      {cake.bakeryNotes && (
                        <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                          <span className="text-[10px] font-bold uppercase block">Bakery Notes:</span>
                          <p className="text-[11px] mt-0.5">{cake.bakeryNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleOpenCakeReview(cake)}
                      className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{cake.confirmedPrice ? 'Update Pricing & Review' : 'Quote Price & Review'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
              <Cake className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold font-serif text-stone-800">No custom cake requests found</h3>
              <p className="text-xs text-stone-500 mt-1">Inquiries submitted by customers will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: USERS & ROLES */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">User Accounts & Roles Master</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Total {filteredUsers.length} accounts found matching current filters
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Roles' },
                { id: 'CUSTOMER', label: 'Customers' },
                { id: 'SHOPKEEPER', label: 'Shopkeepers' },
                { id: 'ADMIN', label: 'Admins' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setUserRoleFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    userRoleFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold">User</th>
                  <th className="px-5 py-3.5 font-bold">Contact</th>
                  <th className="px-5 py-3.5 font-bold">Role</th>
                  <th className="px-5 py-3.5 font-bold">Email Status</th>
                  <th className="px-5 py-3.5 font-bold">Account Access</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const isEnabled = u.enabled !== false
                  const isSelf = u.email.toLowerCase() === user?.email.toLowerCase()

                  return (
                    <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold font-serif text-sm">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block">{u.fullName}</span>
                            <span className="text-[11px] text-stone-400 font-mono">ID: {u.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="text-stone-800 block flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {u.email}
                          </span>
                          <span className="text-stone-500 block flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {u.phoneNumber || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : u.role === 'SHOPKEEPER'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {u.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-stone-400 italic">Current Admin</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatusConfirmUser(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                              isEnabled
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {isEnabled ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Enable</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-stone-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-semibold">No users match the search criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CATEGORIES MASTER */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="h-40 relative bg-stone-100 overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end p-5">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">{cat.name}</h3>
                    <span className="text-xs text-amber-300 font-semibold">{cat.itemCount} Live Product(s)</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-stone-600 leading-relaxed">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SECURITY & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">Security & Operational Audit Logs</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Immutable event stream for user authentication, product management, order updates, and admin actions
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Events' },
                { id: 'ADMIN_CREATE_PRODUCT', label: 'Product Created' },
                { id: 'ADMIN_UPDATE_PRODUCT', label: 'Product Updated' },
                { id: 'ADMIN_DELETE_PRODUCT', label: 'Product Deleted' },
                { id: 'AUTHENTICATION_SUCCESS', label: 'Logins' },
                { id: 'FAILED_AUTHENTICATION', label: 'Failed Logins' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAuditEventFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    auditEventFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Timestamp</th>
                  <th className="px-5 py-3.5 font-bold">Event Type</th>
                  <th className="px-5 py-3.5 font-bold">User Email</th>
                  <th className="px-5 py-3.5 font-bold">IP Address</th>
                  <th className="px-5 py-3.5 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-3.5 text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.eventType.includes('SUCCESS') || log.eventType.includes('CREATE')
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.eventType.includes('DELETE') || log.eventType.includes('FAILED')
                            ? 'bg-rose-100 text-rose-800'
                            : log.eventType.includes('ADMIN') || log.eventType.includes('UPDATE')
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {log.eventType}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-stone-800 font-sans font-medium">{log.email}</td>

                    <td className="px-5 py-3.5 text-stone-500 text-[11px]">{log.ipAddress || '127.0.0.1'}</td>

                    <td className="px-5 py-3.5 text-stone-700 font-sans text-xs max-w-md">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAuditLogs.length === 0 && (
              <div className="p-12 text-center text-stone-400">
                <FileBarChart2 className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-semibold">No audit events match the selected criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: STORE & BAKERY SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Bakery Operations & Kitchen Hours</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Monday – Saturday</span>
                <span className="font-bold text-stone-900">08:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Sunday</span>
                <span className="font-bold text-stone-900">09:00 AM – 09:00 PM</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Custom Cake Lead Time</span>
                <span className="font-bold text-amber-800">Minimum 24 – 48 Hours</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-600 font-medium">Standard Bakery Delivery Fee</span>
                <span className="font-bold text-emerald-700">₹50 (Free over ₹500)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span>Payment & Settlement Configuration</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600 font-medium">UPI Gateway (QR Mode)</span>
                <span className="font-bold text-emerald-700">payalbakery@upi (Active)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Cash on Delivery (COD)</span>
                <span className="font-bold text-stone-900">Enabled for orders &lt; ₹2000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Razorpay Instant Checkout</span>
                <span className="font-bold text-emerald-700">Ready</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-600 font-medium">Store Location</span>
                <span className="font-bold text-stone-900">Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddProductOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-800 tracking-wider block">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  {editingProduct ? editingProduct.name : 'Add Bakery Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddProductOpen(false)
                  setEditingProduct(null)
                }}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Image Upload / Preview */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Product Image *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                    <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Image URL (or upload below)"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 cursor-pointer border border-amber-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleProductImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Red Rosette Cake"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-semibold"
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Customized Cakes">Customized Cakes</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Cupcakes">Cupcakes</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Breads">Breads</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Optional (shows discount)"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Min Lead Time (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.minLeadTimeHours}
                    onChange={(e) => setProductForm({ ...productForm, minLeadTimeHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="One-line summary for product card"
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Full flavor profile, ingredients, and baking details"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                />
              </div>

              {/* Weight Options & Shelf Life */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Weight / Portion Options (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.weightOptions}
                    onChange={(e) => setProductForm({ ...productForm, weightOptions: e.target.value })}
                    placeholder="e.g. 500g, 1kg, 1.5kg"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Shelf Life & Storage
                  </label>
                  <input
                    type="text"
                    value={productForm.shelfLife}
                    onChange={(e) => setProductForm({ ...productForm, shelfLife: e.target.value })}
                    placeholder="e.g. 3–4 days refrigerated"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>
              </div>

              {/* Flags / Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isEggless}
                    onChange={(e) => setProductForm({ ...productForm, isEggless: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800">100% Eggless</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestseller}
                    onChange={(e) => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800">Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800">Featured</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct || isUploadingImage}
                  className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingProduct ? 'Saving to Database...' : editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-serif font-bold text-stone-900">Delete Product from Catalogue?</h3>
              <p className="text-xs text-stone-600 mt-1">
                Are you sure you want to remove <strong>"{deleteConfirmProduct.name}"</strong>?
              </p>
              <p className="text-[11px] text-stone-400 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-left">
                ℹ️ <strong>Safe Delete Guarantee:</strong> This action soft-deletes the product from active sale while preserving historical customer orders and invoices.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-800 tracking-wider block">Order Details</span>
                <h3 className="text-xl font-serif font-bold text-stone-900">{selectedOrder.orderNumber}</h3>
                <span className="text-xs text-stone-400">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery */}
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl my-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Customer Information</span>
                <p className="font-bold text-stone-900 mt-1">{selectedOrder.deliveryAddress?.fullName || 'Customer'}</p>
                <p className="text-stone-600">{selectedOrder.deliveryAddress?.phoneNumber}</p>
                <p className="text-stone-500 mt-1">{selectedOrder.deliveryAddress?.addressLine}</p>
                <p className="text-stone-500">
                  {selectedOrder.deliveryAddress?.areaLocality}, {selectedOrder.deliveryAddress?.city} -{' '}
                  {selectedOrder.deliveryAddress?.pincode}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Delivery & Payment Slot</span>
                <p className="font-bold text-stone-900 mt-1">
                  {selectedOrder.preferredDeliveryDate} ({selectedOrder.preferredDeliveryTime})
                </p>
                <p className="text-stone-600 mt-1">
                  Payment: <span className="font-semibold">{selectedOrder.paymentMethod}</span> (
                  <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span>)
                </p>
              </div>
            </div>

            {/* Itemized Items */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold uppercase text-stone-800 block">Line Items:</span>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-bold text-stone-900">{item.productName}</p>
                      <p className="text-[10px] text-stone-500">
                        {item.weightOption} • Qty: <span className="font-bold text-amber-800">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-sm mb-6">
              <span className="font-bold text-stone-700">Grand Total:</span>
              <span className="font-serif font-bold text-stone-900 text-lg">₹{selectedOrder.grandTotal.toFixed(2)}</span>
            </div>

            {/* Status Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <span className="text-xs font-bold text-stone-700">Admin Status Control:</span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { status: 'CONFIRMED' as OrderStatus, label: 'Confirm' },
                  { status: 'PREPARING' as OrderStatus, label: 'Prep / Bake' },
                  { status: 'READY' as OrderStatus, label: 'Mark Ready' },
                  { status: 'OUT_FOR_DELIVERY' as OrderStatus, label: 'Dispatch' },
                  { status: 'DELIVERED' as OrderStatus, label: 'Delivered' },
                  { status: 'CANCELLED' as OrderStatus, label: 'Cancel' },
                ].map((s) => (
                  <button
                    key={s.status}
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, s.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      selectedOrder.orderStatus === s.status
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-amber-100 text-stone-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Enable/Disable Confirmation Modal */}
      {statusConfirmUser && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                {statusConfirmUser.enabled !== false ? 'Disable User Account?' : 'Enable User Account?'}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Are you sure you want to change login access for{' '}
                <strong>{statusConfirmUser.fullName}</strong> ({statusConfirmUser.email})?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleUserStatus(statusConfirmUser)}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-semibold cursor-pointer ${
                  statusConfirmUser.enabled !== false
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusConfirmUser.enabled !== false ? 'Yes, Disable' : 'Yes, Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cake Review & Quoting Modal */}
      {selectedCake && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-800 tracking-wider block">Custom Cake Review</span>
                <h3 className="text-xl font-serif font-bold text-stone-900">{selectedCake.cakeType}</h3>
                <span className="text-xs text-stone-400">Flavor: {selectedCake.flavor} • {selectedCake.weight}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCake(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCakeReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirmed Pricing (₹) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={cakeReviewForm.confirmedPrice}
                  onChange={(e) => setCakeReviewForm({ ...cakeReviewForm, confirmedPrice: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Review Decision Status *
                </label>
                <select
                  value={cakeReviewForm.status}
                  onChange={(e) => setCakeReviewForm({ ...cakeReviewForm, status: e.target.value as CustomCakeStatus })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="APPROVED">Approved & Quoted</option>
                  <option value="UNDER_REVIEW">Under Kitchen Review</option>
                  <option value="CHANGES_REQUESTED">Changes Suggested</option>
                  <option value="REJECTED">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Bakery Chef Instructions & Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={cakeReviewForm.bakeryNotes}
                  onChange={(e) => setCakeReviewForm({ ...cakeReviewForm, bakeryNotes: e.target.value })}
                  placeholder="Notes on ingredients, design feasibility or customer instructions..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCake(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save & Dispatch Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Inspection Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-4 shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3 px-2">
              <span className="font-serif font-bold text-stone-900 text-sm">{previewImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl">
              <img src={previewImage.url} alt={previewImage.title} className="w-full h-full object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdminDashboard
