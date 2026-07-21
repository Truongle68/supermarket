'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store/useAuthStore"
import { useQuery } from "@tanstack/react-query"
import { useProductStore, Product } from "@/lib/store/useProductStore"
import { ProductModal } from "@/components/admin/ProductModal"
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Search, 
  ShieldAlert, 
  LogOut, 
  RefreshCw,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Layers,
  Box,
  DollarSign
} from "lucide-react"

// Mock stats fetch
const fetchAdminStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return {
    revenue: "148.250.000đ",
    revenueChange: "+12.5% so với tháng trước",
    orders: "1,240 đơn",
    ordersChange: "+8.2% so với tháng trước",
    customers: "842 thành viên",
    customersChange: "+24 thành viên hôm nay",
    conversionRate: "4.8%",
    conversionChange: "+0.4% hôm nay"
  }
}

// Mock orders fetch
const fetchAdminOrders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 900))
  return [
    { id: "ORD-94827", customer: "Nguyễn Văn Hùng", email: "hung@gmail.com", date: "Hôm nay, 14:32", total: "185.000đ", status: "delivering" },
    { id: "ORD-94826", customer: "Trần Thị Lan", email: "lan.tran@yahoo.com", date: "Hôm nay, 11:15", total: "310.000đ", status: "completed" },
    { id: "ORD-94825", customer: "Phạm Minh Đức", email: "ducpm@outlook.com", date: "Hôm qua, 18:40", total: "95.000đ", status: "completed" },
    { id: "ORD-94824", customer: "Lê Thị Hồng", email: "hongle@gmail.com", date: "Hôm qua, 15:10", total: "520.000đ", status: "delivering" },
    { id: "ORD-94823", customer: "Hoàng Anh Tuấn", email: "tuanha@gmail.com", date: "12/07/2026", total: "1.250.000đ", status: "cancelled" },
    { id: "ORD-94822", customer: "Vũ Phương Thảo", email: "thao.vu@gmail.com", date: "12/07/2026", total: "430.000đ", status: "completed" }
  ]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  
  // Dashboard Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview')
  
  // Orders Search
  const [searchTerm, setSearchTerm] = useState("")

  // Product Store & Actions
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductStatus } = useProductStore()
  
  // Product Search & Filter State
  const [productSearch, setProductSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "stock_asc">("newest")

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Fetch admin stats
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    enabled: !!user && user.role === 'admin'
  })

  // Fetch admin orders
  const { data: orders, isLoading: isOrdersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: fetchAdminOrders,
    enabled: !!user && user.role === 'admin'
  })

  const handleRefresh = () => {
    refetchStats()
    refetchOrders()
  }

  // Access guard
  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[1.3rem] text-center max-w-sm w-full shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-slate-100">Yêu cầu quyền Admin</h3>
          <p className="text-sm text-slate-400 mt-2 font-medium">Bạn cần đăng nhập bằng tài khoản quản trị viên (Admin) để truy cập trang này.</p>
          <Link
            href="/login"
            className="mt-6 w-full inline-flex justify-center items-center py-2.5 px-4 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-bold rounded-full text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            Đăng nhập Admin
          </Link>
        </div>
      </div>
    )
  }

  const filteredOrders = orders?.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtered and Sorted Products
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(productSearch.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price
    if (sortBy === "price_desc") return b.price - a.price
    if (sortBy === "stock_asc") return a.stock - b.stock
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Product Inventory Metrics
  const lowStockCount = products.filter(p => p.stock <= 10).length
  const totalInventoryValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex selection:bg-blue-100 selection:text-[#1DA1F2]">
      
      {/* Sidebar - Dark Modern Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-900 hidden md:flex flex-col shrink-0">
        
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-900 gap-2 select-none">
          <span className="text-2xl font-extrabold text-[#1DA1F2] tracking-tight">Tươi. Admin</span>
        </div>

        {/* Admin User Summary */}
        <div className="p-5 border-b border-slate-900 flex items-center gap-3 bg-slate-900/30">
          <div className="h-10 w-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">{user.name}</h4>
            <span className="text-2xs text-[#1DA1F2] font-extrabold tracking-wider uppercase">Hệ thống Admin</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 font-bold rounded-[1.3rem] text-sm transition-all cursor-pointer ${
              activeTab === 'overview'
                ? "bg-[#1DA1F2]/10 text-[#1DA1F2]"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Tổng quan</span>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 font-bold rounded-[1.3rem] text-sm transition-all cursor-pointer ${
              activeTab === 'products'
                ? "bg-[#1DA1F2]/10 text-[#1DA1F2]"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 shrink-0" />
              <span>Quản lý sản phẩm</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-2xs font-extrabold ${
              activeTab === 'products' ? "bg-[#1DA1F2] text-white" : "bg-slate-800 text-slate-300"
            }`}>
              {products.length}
            </span>
          </button>

          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 font-bold rounded-[1.3rem] text-sm transition-all"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            <span>Xem cửa hàng</span>
          </Link>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-900">
          <button 
            onClick={() => {
              logout()
              router.push("/")
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 font-bold rounded-[1.3rem] text-sm border border-slate-800 hover:border-rose-900/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#EBE6DA] px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="md:hidden text-lg font-bold text-[#1DA1F2]">Tươi. Admin</span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#16422F] hidden md:block">
                {activeTab === 'overview' ? "Bảng điều khiển" : "Quản lý sản phẩm"}
              </h2>
              {activeTab === 'products' && (
                <span className="hidden md:inline-flex items-center bg-blue-50 text-[#1DA1F2] text-2xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100">
                  {products.length} Hàng hóa
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch Mobile Tabs */}
            <div className="md:hidden flex items-center bg-slate-100 p-1 rounded-full text-xs font-bold">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-full ${activeTab === 'overview' ? "bg-white shadow text-[#1DA1F2]" : "text-slate-600"}`}
              >
                Tổng quan
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1 rounded-full ${activeTab === 'products' ? "bg-white shadow text-[#1DA1F2]" : "text-slate-600"}`}
              >
                Sản phẩm
              </button>
            </div>

            <button 
              onClick={handleRefresh}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-slate-50 transition-all text-[#64716A]"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>

            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-slate-50 transition-all text-[#64716A] relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-[#1DA1F2] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Welcome Banner */}
              <div className="bg-slate-950 text-slate-100 rounded-[1.3rem] p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-900">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative z-10">
                  <h1 className="text-2xl font-extrabold tracking-tight">Chào mừng trở lại, {user.name}!</h1>
                  <p className="text-slate-400 text-sm mt-1">Hệ thống đang hoạt động ổn định. Xem thống kê bán hàng hôm nay.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="px-5 py-2.5 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-extrabold text-xs rounded-full transition-all shrink-0 select-none shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Quản lý kho hàng</span>
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Doanh thu</span>
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    {isStatsLoading ? (
                      <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-md"></div>
                    ) : (
                      <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.revenue}</h3>
                    )}
                    <span className="text-xs text-emerald-600 font-bold block mt-1">{stats?.revenueChange}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Đơn đặt hàng</span>
                    <div className="h-10 w-10 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    {isStatsLoading ? (
                      <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md"></div>
                    ) : (
                      <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.orders}</h3>
                    )}
                    <span className="text-xs text-emerald-600 font-bold block mt-1">{stats?.ordersChange}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Khách hàng</span>
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    {isStatsLoading ? (
                      <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-md"></div>
                    ) : (
                      <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.customers}</h3>
                    )}
                    <span className="text-xs text-[#1DA1F2] font-bold block mt-1">{stats?.customersChange}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Tỷ lệ chuyển đổi</span>
                    <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    {isStatsLoading ? (
                      <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-md"></div>
                    ) : (
                      <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.conversionRate}</h3>
                    )}
                    <span className="text-xs text-emerald-600 font-bold block mt-1">{stats?.conversionChange}</span>
                  </div>
                </div>
              </div>

              {/* Orders Table Container */}
              <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#16422F]">Quản lý đơn hàng</h3>
                    <p className="text-xs text-[#64716A] font-semibold mt-0.5">Danh sách các đơn đặt hàng mới trên trang web.</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E9B94]" />
                    <input
                      type="text"
                      placeholder="Tìm đơn hàng, khách hàng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#C6C0B0] bg-[#FDFBF7] rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all"
                    />
                  </div>
                </div>

                {isOrdersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#8E9B94]">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#1DA1F2] mb-2" />
                    <span className="text-xs font-bold">Đang tải danh sách đơn hàng...</span>
                  </div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#F3EFE6] text-2xs font-extrabold uppercase tracking-wider text-[#8E9B94]">
                          <th className="pb-3 pr-4">Mã đơn</th>
                          <th className="pb-3 px-4">Khách hàng</th>
                          <th className="pb-3 px-4">Ngày đặt</th>
                          <th className="pb-3 px-4 text-right">Tổng thanh toán</th>
                          <th className="pb-3 pl-4 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3EFE6]">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="text-xs hover:bg-[#FAF6EC]/25 transition-all">
                            <td className="py-3.5 pr-4 font-extrabold text-[#16422F]">{order.id}</td>
                            <td className="py-3.5 px-4 font-semibold">
                              <p className="text-[#1E2522]">{order.customer}</p>
                              <span className="text-2xs text-[#8E9B94]">{order.email}</span>
                            </td>
                            <td className="py-3.5 px-4 text-[#64716A] font-semibold">{order.date}</td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">{order.total}</td>
                            <td className="py-3.5 pl-4 text-center">
                              {order.status === "completed" && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-emerald-100">
                                  <CheckCircle className="w-3 h-3" />
                                  Hoàn thành
                                </span>
                              )}
                              {order.status === "delivering" && (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-blue-100">
                                  <Clock className="w-3 h-3" />
                                  Đang giao
                                </span>
                              )}
                              {order.status === "cancelled" && (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-rose-100">
                                  <XCircle className="w-3 h-3" />
                                  Đã hủy
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#8E9B94]">
                    <p className="text-sm font-semibold">Không tìm thấy đơn hàng nào.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT TAB */}
          {activeTab === 'products' && (
            <>
              {/* Product Inventory Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Products */}
                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Tổng mặt hàng</span>
                    <div className="h-10 w-10 bg-blue-50 text-[#1DA1F2] rounded-full flex items-center justify-center font-bold">
                      <Box className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-[#16422F]">{products.length} sản phẩm</h3>
                    <span className="text-xs text-[#64716A] font-semibold block mt-1">Đang kinh doanh trong cửa hàng</span>
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-amber-400/40 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Cảnh báo tồn kho</span>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-[#16422F]">{lowStockCount} sản phẩm</h3>
                    <span className={`text-xs font-bold block mt-1 ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {lowStockCount > 0 ? "Cần nhập thêm hàng (≤ 10)" : "Tồn kho đầy đủ, ổn định"}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Danh mục ngành hàng</span>
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-[#16422F]">{categories.length} danh mục</h3>
                    <span className="text-xs text-[#1DA1F2] font-semibold block mt-1">Phân loại hàng hóa tự động</span>
                  </div>
                </div>

                {/* Total Inventory Valuation */}
                <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Giá trị kho hàng</span>
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-[#16422F]">
                      {totalInventoryValue.toLocaleString('vi-VN')}đ
                    </h3>
                    <span className="text-xs text-emerald-600 font-bold block mt-1">Ước tính giá trị hàng còn lại</span>
                  </div>
                </div>

              </div>

              {/* Product Management Table Card */}
              <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm space-y-6">
                
                {/* Header Controls & Filter Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F3EFE6]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#16422F]">Danh sách sản phẩm</h3>
                    <p className="text-xs text-[#64716A] font-semibold mt-0.5">
                      Tìm kiếm, lọc, chỉnh sửa hoặc cập nhật số lượng tồn kho trực tiếp.
                    </p>
                  </div>

                  {/* Right Action: Add product */}
                  <button
                    onClick={() => {
                      setEditingProduct(null)
                      setIsAddModalOpen(true)
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#1DA1F2] hover:bg-[#1A91DA] text-white text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm sản phẩm mới</span>
                  </button>
                </div>

                {/* Filter Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E9B94]" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên, SKU, mã SP..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-xl text-xs font-semibold text-[#1E2522] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
                    >
                      <option value="all">📁 Tất cả danh mục ({products.length})</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat} ({products.filter(p => p.category === cat).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-xl text-xs font-semibold text-[#1E2522] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
                    >
                      <option value="all">🟢 Tất cả trạng thái</option>
                      <option value="active">🟢 Đang bán ({products.filter(p => p.status === 'active').length})</option>
                      <option value="out_of_stock">🔴 Hết hàng ({products.filter(p => p.status === 'out_of_stock').length})</option>
                      <option value="hidden">⚪ Tạm ẩn ({products.filter(p => p.status === 'hidden').length})</option>
                    </select>
                  </div>

                  {/* Sorting */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-xl text-xs font-semibold text-[#1E2522] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
                    >
                      <option value="newest">🕒 Mới nhất trước</option>
                      <option value="price_asc">💵 Giá tăng dần</option>
                      <option value="price_desc">💎 Giá giảm dần</option>
                      <option value="stock_asc">⚠️ Tồn kho ít nhất</option>
                    </select>
                  </div>

                </div>

                {/* Product Table */}
                {filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto border border-[#EBE6DA] rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF6EC] border-b border-[#EBE6DA] text-2xs font-extrabold uppercase tracking-wider text-[#8E9B94]">
                          <th className="py-3.5 px-4">Sản phẩm</th>
                          <th className="py-3.5 px-4">Danh mục</th>
                          <th className="py-3.5 px-4 text-right">Giá bán</th>
                          <th className="py-3.5 px-4 text-center">Tồn kho</th>
                          <th className="py-3.5 px-4 text-center">Nhãn</th>
                          <th className="py-3.5 px-4 text-center">Trạng thái</th>
                          <th className="py-3.5 px-4 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3EFE6] bg-white">
                        {filteredProducts.map((item) => (
                          <tr key={item.id} className="text-xs hover:bg-[#FAF6EC]/30 transition-all">
                            
                            {/* Product info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                                  {item.image}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-[#16422F] text-xs truncate max-w-[200px]">{item.name}</h4>
                                  <div className="flex items-center gap-2 text-2xs text-[#8E9B94] font-semibold mt-0.5">
                                    <span>{item.id}</span>
                                    <span>·</span>
                                    <span>{item.sku}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4">
                              <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-2xs font-bold border border-slate-200">
                                {item.category}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4 text-right">
                              <span className="font-extrabold text-emerald-700 block">
                                {item.price.toLocaleString('vi-VN')}đ
                              </span>
                              {item.originalPrice > item.price && (
                                <span className="text-2xs text-[#8E9B94] line-through font-bold block mt-0.5">
                                  {item.originalPrice.toLocaleString('vi-VN')}đ
                                </span>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${
                                  item.stock > 10 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : item.stock > 0 
                                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}>
                                  {item.stock} {item.unit}
                                </span>
                                {item.stock <= 10 && item.stock > 0 && (
                                  <span className="text-3xs text-amber-600 font-extrabold mt-0.5">Sắp hết</span>
                                )}
                              </div>
                            </td>

                            {/* Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {item.badge ? (
                                <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-2xs font-extrabold border border-amber-200">
                                  {item.badge}
                                </span>
                              ) : (
                                <span className="text-2xs text-slate-300 font-bold">-</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              {item.status === 'active' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-emerald-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  Đang bán
                                </span>
                              )}
                              {item.status === 'out_of_stock' && (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-rose-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                  Hết hàng
                                </span>
                              )}
                              {item.status === 'hidden' && (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-slate-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                  Tạm ẩn
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Toggle visibility/status */}
                                <button
                                  onClick={() => toggleProductStatus(item.id)}
                                  className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                                  title={item.status === 'hidden' ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                                >
                                  {item.status === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setEditingProduct(item)
                                    setIsAddModalOpen(true)
                                  }}
                                  className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1DA1F2] flex items-center justify-center transition-all cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setDeletingProduct(item)}
                                  className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#FAF6EC]/40 border border-dashed border-[#C6C0B0] rounded-2xl">
                    <Package className="w-12 h-12 text-[#8E9B94] mx-auto mb-3" />
                    <h4 className="text-sm font-extrabold text-[#16422F]">Không tìm thấy sản phẩm phù hợp</h4>
                    <p className="text-xs text-[#64716A] font-semibold mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
                    <button
                      onClick={() => {
                        setProductSearch("")
                        setCategoryFilter("all")
                        setStatusFilter("all")
                      }}
                      className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-full transition-all cursor-pointer"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                )}

              </div>
            </>
          )}

        </main>
      </div>

      {/* Product Add / Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            deleteProduct(deletingProduct.id)
            setDeletingProduct(null)
          }
        }}
        product={deletingProduct}
      />

    </div>
  )
}
