'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store/useAuthStore"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldAlert, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck,
  Loader2,
  RefreshCw
} from "lucide-react"

// Mock order list for packing board
const initialOrders = [
  { id: "ORD-94827", customer: "Nguyễn Văn Hùng", address: "123 Đường Láng, Hà Nội", items: "🥦 Cà chua bi hữu cơ x2, 🥑 Bơ sáp Đắk Lắk x1", status: "pending" },
  { id: "ORD-94824", customer: "Lê Thị Hồng", address: "45 Hàng Bài, Hoàn Kiếm, Hà Nội", items: "🥬 Rau muống nước sạch x4, 🥚 Trứng gà sạch x2", status: "packing" },
  { id: "ORD-94830", customer: "Đỗ Minh Quân", address: "88 Cầu Giấy, Hà Nội", items: "🥩 Bơ sáp Đắk Lắk x2, 🍎 Táo Envy nhập khẩu x2", status: "pending" },
  { id: "ORD-94831", customer: "Hoàng Thanh Hà", address: "12 Chùa Bộc, Đống Đa, Hà Nội", items: "🥚 Trứng gà sạch x1, 🥦 Cà chua bi hữu cơ x3", status: "ready" },
  { id: "ORD-94832", customer: "Nguyễn Bích Ngọc", address: "55 Kim Mã, Ba Đình, Hà Nội", items: "🥤 Trà sữa hữu cơ x3", status: "pending" }
]

export default function StaffDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState(initialOrders)

  // Simulate updating order packing status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { id, newStatus }
    },
    onSuccess: (data) => {
      setOrders(prev => prev.map(order => 
        order.id === data.id ? { ...order, status: data.newStatus } : order
      ))
    }
  })

  // Access guard
  if (!isAuthenticated || !user || user.role !== "staff") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[1.3rem] text-center max-w-sm w-full shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-[#10b981] mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-slate-100">Yêu cầu quyền Nhân viên</h3>
          <p className="text-sm text-slate-400 mt-2 font-medium">Bạn cần đăng nhập bằng tài khoản Nhân viên vận hành (Staff) để truy cập trang này.</p>
          <Link
            href="/portal/login"
            className="mt-6 w-full inline-flex justify-center items-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-sm shadow-md shadow-emerald-500/20 transition-all"
          >
            Đăng nhập Staff
          </Link>
        </div>
      </div>
    )
  }

  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            Chờ đóng gói
          </span>
        )
      case "packing":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-blue-100 animate-pulse">
            <Package className="w-3.5 h-3.5" />
            Đang đóng gói
          </span>
        )
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sẵn sàng giao
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1C201E] text-slate-200 border-r border-[#2C312E] hidden md:flex flex-col shrink-0">
        
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-[#2C312E] gap-2 select-none">
          <span className="text-2xl font-extrabold text-emerald-500 tracking-tight">Tươi. Staff</span>
        </div>

        {/* Staff User Summary */}
        <div className="p-5 border-b border-[#2C312E] flex items-center gap-3 bg-black/10">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">{user.name}</h4>
            <span className="text-2xs text-emerald-400 font-extrabold tracking-wider uppercase">Fulfillment Team</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/staff" 
            className="flex items-center gap-3 px-4 py-3 bg-emerald-800/30 text-emerald-400 font-bold rounded-2xl text-sm transition-all"
          >
            <Package className="w-5 h-5 shrink-0" />
            <span>Danh sách đóng gói</span>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/20 font-bold rounded-2xl text-sm transition-all"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            <span>Xem cửa hàng</span>
          </Link>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#2C312E]">
          <button 
            onClick={() => {
              logout()
              router.push("/")
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 font-bold rounded-2xl text-sm border border-slate-700 hover:border-rose-900/30 transition-all cursor-pointer"
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
            <span className="md:hidden text-lg font-bold text-emerald-600">Tươi. Staff</span>
            <h2 className="text-xl font-extrabold text-[#16422F] hidden md:block">Bảng xử lý đơn hàng</h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setOrders(initialOrders)}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-slate-50 transition-all text-[#64716A]"
              title="Reset dữ liệu đóng gói"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* Welcome Banner */}
          <div className="bg-[#1C201E] text-slate-100 rounded-[2rem] p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#2C312E]">
            <div className="relative z-10">
              <h1 className="text-2xl font-extrabold tracking-tight">Xin chào, {user.name}!</h1>
              <p className="text-slate-400 text-sm mt-1">Cửa hàng hiện tại có <strong>{orders.filter(o => o.status === 'pending').length}</strong> đơn chưa đóng gói. Hãy chuẩn bị đóng gói hàng hóa nhanh chóng.</p>
            </div>
            <div className="flex gap-4 relative z-10 shrink-0">
              <div className="bg-slate-800 px-4 py-2 rounded-xl text-center border border-slate-700">
                <span className="text-xs text-slate-400 block font-bold">Chờ đóng gói</span>
                <span className="text-lg font-extrabold text-amber-400">{orders.filter(o => o.status === 'pending').length}</span>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-xl text-center border border-slate-700">
                <span className="text-xs text-slate-400 block font-bold">Đang đóng gói</span>
                <span className="text-lg font-extrabold text-blue-400">{orders.filter(o => o.status === 'packing').length}</span>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-xl text-center border border-slate-700">
                <span className="text-xs text-slate-400 block font-bold">Sẵn sàng giao</span>
                <span className="text-lg font-extrabold text-emerald-400">{orders.filter(o => o.status === 'ready').length}</span>
              </div>
            </div>
          </div>

          {/* Packing Board Container */}
          <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 shadow-sm">
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#16422F]">Hàng đợi đóng gói</h3>
                <p className="text-xs text-[#64716A] font-semibold mt-0.5">Thực hiện đóng gói rau củ quả tươi sạch cho đơn hàng trực tuyến.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E9B94]" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#C6C0B0] bg-[#FDFBF7] rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            {/* Table */}
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F3EFE6] text-2xs font-extrabold uppercase tracking-wider text-[#8E9B94]">
                      <th className="pb-3 pr-4">Mã đơn</th>
                      <th className="pb-3 px-4">Khách hàng</th>
                      <th className="pb-3 px-4">Nội dung sản phẩm</th>
                      <th className="pb-3 px-4">Trạng thái</th>
                      <th className="pb-3 pl-4 text-right">Hành động đóng gói</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3EFE6]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="text-xs hover:bg-[#FAF6EC]/25 transition-all">
                        <td className="py-4 pr-4 font-extrabold text-[#16422F]">{order.id}</td>
                        <td className="py-4 px-4 font-semibold">
                          <p className="text-[#1E2522]">{order.customer}</p>
                          <span className="text-2xs text-[#8E9B94]">{order.address}</span>
                        </td>
                        <td className="py-4 px-4 text-[#5D6B63] font-semibold max-w-xs">{order.items}</td>
                        <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-4 pl-4 text-right">
                          <div className="flex justify-end gap-2">
                            {order.status === "pending" && (
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: order.id, newStatus: "packing" })}
                                disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : null}
                                <span>Bắt đầu soạn hàng</span>
                              </button>
                            )}
                            {order.status === "packing" && (
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: order.id, newStatus: "ready" })}
                                disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : null}
                                <span>Xác nhận đóng gói xong</span>
                              </button>
                            )}
                            {order.status === "ready" && (
                              <span className="text-emerald-700 font-extrabold flex items-center gap-1 mr-2 select-none">
                                <CheckCircle2 className="w-4 h-4" />
                                Đã sẵn sàng bàn giao shipper
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-[#8E9B94]">
                <p className="text-sm font-semibold">Không tìm thấy đơn hàng nào trong hàng đợi.</p>
              </div>
            )}

          </div>

        </main>
      </div>

    </div>
  )
}
