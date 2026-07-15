'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store/useAuthStore"
import { useQuery } from "@tanstack/react-query"
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
  ExternalLink
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
  const [searchTerm, setSearchTerm] = useState("")

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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex selection:bg-blue-100 selection:text-[#1DA1F2]">
      
      {/* Sidebar - Twitter Styled Dark Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-900 hidden md:flex flex-col shrink-0">
        
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-900 gap-2 select-none">
          <span className="text-2xl font-extrabold text-[#1DA1F2] tracking-tight">Tươi. Admin</span>
        </div>

        {/* Admin User Summary */}
        <div className="p-5 border-b border-slate-900 flex items-center gap-3 bg-slate-900/30">
          <div className="h-10 w-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-sm font-bold shadow-md">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">{user.name}</h4>
            <span className="text-2xs text-[#1DA1F2] font-extrabold tracking-wider uppercase">Hệ thống Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 bg-[#1DA1F2]/10 text-[#1DA1F2] font-bold rounded-[1.3rem] text-sm transition-all"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Tổng quan</span>
          </Link>
          
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
        
        {/* Main Navbar */}
        <header className="h-20 bg-white border-b border-[#EBE6DA] px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle (Placeholder) */}
            <span className="md:hidden text-lg font-bold text-[#1DA1F2]">Tươi. Admin</span>
            
            <h2 className="text-xl font-extrabold text-[#16422F] hidden md:block">Bảng điều khiển</h2>
          </div>

          <div className="flex items-center gap-4">
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

        {/* Dashboard Content */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* Welcome Banner */}
          <div className="bg-slate-950 text-slate-100 rounded-[1.3rem] p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-900">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10">
              <h1 className="text-2xl font-extrabold tracking-tight">Chào mừng trở lại, {user.name}!</h1>
              <p className="text-slate-400 text-sm mt-1">Hệ thống đang hoạt động ổn định. Xem thống kê bán hàng hôm nay.</p>
            </div>
            <button 
              onClick={() => router.push("/")}
              className="px-5 py-2.5 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-extrabold text-xs rounded-full transition-all shrink-0 select-none shadow-md shadow-blue-500/25 cursor-pointer"
            >
              Ghé thăm cửa hàng
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stat Card: Revenue */}
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

            {/* Stat Card: Orders */}
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

            {/* Stat Card: Customers */}
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

            {/* Stat Card: Conversion */}
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
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#16422F]">Quản lý đơn hàng</h3>
                <p className="text-xs text-[#64716A] font-semibold mt-0.5">Danh sách các đơn đặt hàng mới trên trang web.</p>
              </div>

              {/* Search input */}
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

            {/* Table */}
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

        </main>
      </div>

    </div>
  )
}
