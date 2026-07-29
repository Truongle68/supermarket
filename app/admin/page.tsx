'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store/useAuthStore"
import { useProductStore, Product } from "@/lib/store/useProductStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ShieldAlert, Loader2 } from "lucide-react"

// Admin Components
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminOverviewStats } from "@/components/admin/AdminOverviewStats"
import { AdminInventoryStats } from "@/components/admin/AdminInventoryStats"
import { AdminOrdersTable, AdminOrder } from "@/components/admin/AdminOrdersTable"
import { AdminProductsTable } from "@/components/admin/AdminProductsTable"
import { ProductModal } from "@/components/admin/ProductModal"
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal"

// Admin stats fetcher (returns initial empty state or API stats)
const fetchAdminStats = async () => {
  return {
    revenue: "0đ",
    revenueChange: "Chưa có dữ liệu",
    orders: "0 đơn",
    ordersChange: "Chưa có dữ liệu",
    customers: "0 thành viên",
    customersChange: "Chưa có dữ liệu",
    conversionRate: "0%",
    conversionChange: "Chưa có dữ liệu"
  }
}

// Admin orders fetcher (returns initial empty list or API orders)
const fetchAdminOrders = async (): Promise<AdminOrder[]> => {
  return []
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated, logout } = useAuth()
  const queryClient = useQueryClient()

  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview')
  const [searchTerm, setSearchTerm] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Zustand product store
  const { 
    products, 
    categories, 
    apiCategories,
    isLoading,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductStatus,
    fetchProductsFromApi,
    fetchCategoriesFromApi,
    searchProductsFromApi
  } = useProductStore()

  const [isPending, setIsPending] = useState(false)

  // Load backend API categories on mount
  useEffect(() => {
    fetchCategoriesFromApi().catch(console.error)
  }, [fetchCategoriesFromApi])

  // Instant & Debounced API Search for Admin Products
  useEffect(() => {
    setIsPending(true)
    const delay = productSearch.trim() ? 300 : 0

    const timer = setTimeout(() => {
      const selectedCatObj = apiCategories.find(
        (c) => c.name_vi === categoryFilter || c.name_en === categoryFilter
      )
      const categoryId = selectedCatObj?.id

      const req = productSearch.trim()
        ? searchProductsFromApi({
            q: productSearch.trim(),
            category_id: categoryId,
          })
        : categoryFilter !== "all"
        ? fetchProductsFromApi({ category_id: categoryId })
        : fetchProductsFromApi()

      req.finally(() => setIsPending(false))
    }, delay)

    return () => clearTimeout(timer)
  }, [productSearch, categoryFilter, apiCategories, searchProductsFromApi, fetchProductsFromApi])

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  // React Query for admin stats & orders
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    enabled: isHydrated && isAuthenticated && isAdmin
  })

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchAdminOrders,
    enabled: isHydrated && isAuthenticated && isAdmin
  })

  // Protect Admin Route only after Zustand hydration completes!
  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated || !isAdmin) {
      router.push('/')
    }
  }, [isHydrated, isAuthenticated, isAdmin, router])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#1DA1F2] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-8 max-w-md w-full text-center shadow-xl">
          <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#16422F]">Truy cập bị từ chối</h2>
          <p className="text-xs text-[#64716A] font-semibold mt-2">
            Bạn không có quyền quản trị viên để truy cập trang này.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full py-3 bg-[#16422F] text-white text-xs font-extrabold rounded-full hover:bg-[#113425] transition-all"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    )
  }

  // Refresh handler
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
    fetchProductsFromApi().catch(console.error)
  }

  // Metrics calculation
  const lowStockCount = products.filter(p => p.stock <= 10).length
  const totalInventoryValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex selection:bg-blue-100 selection:text-[#1DA1F2]">
      
      {/* Sidebar Navigation Component */}
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productCount={products.length}
        onLogout={() => {
          logout()
          router.push('/')
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Component */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          productCount={products.length}
          onRefresh={handleRefresh}
        />

        {/* Dynamic Main Body Section */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <AdminOverviewStats stats={stats || null} isLoading={isStatsLoading} />
              <AdminOrdersTable
                orders={orders}
                isLoading={isOrdersLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <>
              <AdminInventoryStats
                productCount={products.length}
                lowStockCount={lowStockCount}
                categoryCount={categories.length}
                totalInventoryValue={totalInventoryValue}
              />
              <AdminProductsTable
                products={products}
                categories={categories}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                isLoading={isLoading || isPending}
                onAddClick={() => {
                  setEditingProduct(null)
                  setIsAddModalOpen(true)
                }}
                onEditClick={(prod) => {
                  setEditingProduct(prod)
                  setIsAddModalOpen(true)
                }}
                onDeleteClick={(prod) => setDeletingProduct(prod)}
                onToggleStatus={(id) => toggleProductStatus(id)}
              />
            </>
          )}

        </main>
      </div>

      {/* Modal Add / Edit Product Component */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={(data) => {
          if (editingProduct) {
            updateProduct(editingProduct.id, data)
          } else {
            addProduct(data)
          }
        }}
        initialData={editingProduct}
        categories={categories}
      />

      {/* Modal Delete Product Confirmation Component */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            deleteProduct(deletingProduct.id)
            setDeletingProduct(null)
          }
        }}
      />

    </div>
  )
}
