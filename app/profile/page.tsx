'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store/useAuthStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  ShoppingBag, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  Save,
  LogOut,
  ShieldAlert
} from "lucide-react"

// Mock Order History Data
const fetchOrders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return [
    {
      id: "ORD-94827",
      date: "12/07/2026",
      status: "delivering",
      total: "185.000đ",
      items: "🥦 Cà chua bi hữu cơ x2, 🥑 Bơ sáp x1"
    },
    {
      id: "ORD-91048",
      date: "05/07/2026",
      status: "completed",
      total: "420.000đ",
      items: "🥩 Bò Mỹ phi lê x1, 🥚 Trứng gà sạch x2"
    },
    {
      id: "ORD-89304",
      date: "28/06/2026",
      status: "cancelled",
      total: "95.000đ",
      items: "🥤 Trà sữa hữu cơ x2"
    }
  ]
}

export default function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, accessToken, refreshToken, isAuthenticated, login, logout } = useAuth()

  // Tab management: "profile" | "address" | "password" | "orders"
  const [activeTab, setActiveTab] = useState<"profile" | "address" | "password" | "orders">("profile")

  // Profile fields state
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Fetch real profile data from backend
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", user?.username],
    queryFn: async () => {
      if (!accessToken) return null
      const res = await fetch("/api/v1/users/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Không thể lấy thông tin hồ sơ.")
      }
      return data.data
    },
    enabled: !!accessToken,
  })

  // Load profile states when loaded from backend
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "")
      setPhone(profile.phone || "")
      setEmail(profile.email || "")
      const localAddress = localStorage.getItem(`address_${profile.username}`) || "123 Đường Láng, Đống Đa, Hà Nội"
      setAddress(localAddress)
    }
  }, [profile])

  // Fetch orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["ordersHistory"],
    queryFn: fetchOrders,
    enabled: !!user,
  })

  // Update profile mutation calling user-service PUT /users/profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: { name: string; phone: string; email: string; address: string }) => {
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          full_name: updatedData.name,
          phone: updatedData.phone,
          email: updatedData.email
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Cập nhật hồ sơ thất bại.")
      }

      if (profile?.username) {
        localStorage.setItem(`address_${profile.username}`, updatedData.address)
      }
      return data.data
    },
    onSuccess: (data) => {
      if (user) {
        login({ ...user, name: data.full_name, phone: data.phone, email: data.email }, accessToken!, refreshToken!)
      }
      refetchProfile()
      setSuccessMsg("Cập nhật thông tin hồ sơ thành công!")
      setTimeout(() => setSuccessMsg(""), 3000)
    },
    onError: (err: any) => {
      alert(err.message || "Có lỗi xảy ra khi cập nhật hồ sơ.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({ name, phone, email, address })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải dài ít nhất 8 ký tự")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Xác nhận mật khẩu mới không trùng khớp")
      return
    }

    setPasswordLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPasswordLoading(false)
    
    setPasswordSuccess("Đổi mật khẩu thành công!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center p-4">
        <div className="bg-white border border-[#EBE6DA] p-8 rounded-[2rem] text-center max-w-sm w-full shadow-sm">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-[#16422F]">Truy cập bị từ chối</h3>
          <p className="text-sm text-[#64716A] mt-2 font-medium">Bạn cần đăng nhập tài khoản khách hàng để xem trang này.</p>
          <Link
            href="/login"
            className="mt-6 w-full inline-flex justify-center items-center py-2.5 px-4 bg-[#1B4D3E] text-white font-bold rounded-2xl text-sm hover:bg-[#12362C] transition-all"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Top Banner & Header */}
      <div className="bg-[#1C201E] text-[#DCE2DE] py-2 px-4 text-center text-xs font-medium tracking-wide">
        Hồ sơ khách hàng Tươi. · Ưu đãi độc quyền theo hạng thành viên
      </div>

      <header className="border-b border-[#F3EFE6] bg-[#FDFBF7] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] bg-white hover:bg-neutral-50 transition-all text-[#64716A] hover:text-[#16422F]"
              title="Quay lại Trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-1.5 select-none">
              <span className="text-2xl font-extrabold tracking-tight text-[#16422F]">Tươi</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-2"></span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                logout()
                router.push("/")
              }}
              className="h-10 px-4 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-bold flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#16422F] tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-[#64716A] text-sm mt-1">Quản lý thông tin liên hệ và theo dõi đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 shadow-sm space-y-6">
              {/* User Brief info */}
              <div className="flex items-center gap-4 pb-6 border-b border-[#F3EFE6]">
                <div className="h-12 w-12 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-lg font-bold shadow-sm select-none shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[#16422F] text-sm truncate">{user.name}</h4>
                  <p className="text-[10px] text-[#8E9B94] font-bold uppercase tracking-wider">Thành viên hạng Vàng</p>
                </div>
              </div>

              {/* Navigation groups */}
              <div className="space-y-4">
                {/* Group 1: Tài khoản của tôi */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#1E2522] font-bold text-xs uppercase tracking-wider px-3 select-none">
                    <User className="w-4 h-4 text-[#8E9B94]" />
                    Tài khoản của tôi
                  </div>
                  <div className="pl-6 space-y-1 border-l border-[#F3EFE6] ml-5">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === "profile" 
                          ? "bg-[#1B4D3E]/10 text-[#1B4D3E]" 
                          : "text-[#5D6B63] hover:text-[#16422F]"
                      }`}
                    >
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => setActiveTab("address")}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === "address" 
                          ? "bg-[#1B4D3E]/10 text-[#1B4D3E]" 
                          : "text-[#5D6B63] hover:text-[#16422F]"
                      }`}
                    >
                      Địa chỉ
                    </button>
                    <button
                      onClick={() => setActiveTab("password")}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === "password" 
                          ? "bg-[#1B4D3E]/10 text-[#1B4D3E]" 
                          : "text-[#5D6B63] hover:text-[#16422F]"
                      }`}
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>

                {/* Group 2: Đơn hàng của tôi */}
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "orders" 
                      ? "bg-[#1B4D3E] text-white" 
                      : "text-[#1E2522] hover:bg-neutral-50 text-[#5D6B63]"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Đơn hàng của tôi
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="lg:col-span-3">
            {/* 1. Tab PROFILE */}
            {activeTab === "profile" && (
              <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[#16422F] mb-6 flex items-center gap-2 pb-4 border-b border-[#F3EFE6]">
                  Hồ sơ cá nhân
                </h3>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <form onSubmit={handleSubmit} className="space-y-5 flex-1 w-full max-w-lg order-2 md:order-1">
                    {successMsg && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold">
                        {successMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1E2522]">Tên đăng nhập</label>
                        <input
                          type="text"
                          disabled
                          value={profile?.username || user.username || ""}
                          className="mt-1 block w-full px-3 py-2.5 bg-[#FAF8F2] border border-[#E5DFCE] rounded-xl text-xs font-semibold text-[#8E9B94] cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1E2522]">Địa chỉ Email</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                          placeholder="example@gmail.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E2522]">Họ và tên</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E2522]">Số điện thoại</label>
                      <div className="mt-1 relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-[#8E9B94]" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                          placeholder="Chưa cập nhật số điện thoại"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="inline-flex justify-center items-center py-2.5 px-6 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Đang lưu lại...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 mr-1.5" />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Right Column: Avatar Display */}
                  <div className="flex flex-col items-center justify-center p-6 border border-[#EBE6DA] bg-[#FAF8F2]/30 rounded-2xl w-full md:w-56 shrink-0 order-1 md:order-2">
                    <div className="h-24 w-24 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md select-none">
                      {user.name.charAt(0)}
                    </div>
                    <h4 className="mt-4 font-bold text-[#16422F] text-sm truncate max-w-full">@{profile?.username || user.username}</h4>
                    <p className="text-[10px] text-[#8E9B94] font-semibold mt-1">Hạng: Thành viên Vàng</p>
                    <button type="button" className="mt-4 py-1.5 px-4 border border-[#C6C0B0] hover:bg-neutral-100 rounded-xl text-[10px] font-bold transition-all text-[#5D6B63] cursor-pointer">
                      Chọn ảnh đại diện
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Tab ADDRESS */}
            {activeTab === "address" && (
              <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[#16422F] mb-6 flex items-center gap-2 pb-4 border-b border-[#F3EFE6]">
                  Địa chỉ giao hàng
                </h3>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (profile?.username) {
                    localStorage.setItem(`address_${profile.username}`, address)
                    setSuccessMsg("Cập nhật địa chỉ thành công!")
                    setTimeout(() => setSuccessMsg(""), 3000)
                  }
                }} className="space-y-5 max-w-lg">
                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold">
                      {successMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1E2522]">Địa chỉ đầy đủ (Số nhà, tên đường, phường/xã, quận/huyện)</label>
                    <div className="mt-1 relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#8E9B94]" />
                      <input
                        type="text"
                        value={address}
                        required
                        onChange={(e) => setAddress(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                        placeholder="Nhập địa chỉ nhận hàng của bạn"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex justify-center items-center py-2.5 px-6 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Lưu địa chỉ
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. Tab PASSWORD */}
            {activeTab === "password" && (
              <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[#16422F] mb-6 flex items-center gap-2 pb-4 border-b border-[#F3EFE6]">
                  Đổi mật khẩu
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                  {passwordSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold">
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1E2522]">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E2522]">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                      placeholder="Tối thiểu 8 ký tự"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E2522]">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="inline-flex justify-center items-center py-2.5 px-6 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {passwordLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        "Cập nhật mật khẩu"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. Tab ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 sm:p-8 shadow-sm h-full">
                <h3 className="text-xl font-bold text-[#16422F] mb-6 flex items-center gap-2 pb-4 border-b border-[#F3EFE6]">
                  Lịch sử mua hàng
                </h3>

                {isOrdersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#8E9B94]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
                    <p className="text-xs font-bold mt-2">Đang tải lịch sử đơn hàng...</p>
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border border-[#F3EFE6] rounded-2xl p-5 hover:border-emerald-200 transition-all bg-[#FAF6EC]/30"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3EFE6] pb-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-sm text-[#16422F]">{order.id}</span>
                            <span className="text-2xs text-[#8E9B94] font-semibold">{order.date}</span>
                          </div>
                          <div>
                            {order.status === "completed" && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-2xs font-extrabold border border-emerald-100">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Đã hoàn thành
                              </span>
                            )}
                            {order.status === "delivering" && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-2xs font-extrabold border border-blue-100">
                                <Truck className="w-3.5 h-3.5" />
                                Đang vận chuyển
                              </span>
                            )}
                            {order.status === "cancelled" && (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-2xs font-extrabold border border-rose-100">
                                <XCircle className="w-3.5 h-3.5" />
                                Đã hủy
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="text-xs text-[#5D6B63] font-semibold">
                            <p className="text-[#1E2522]">{order.items}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-2xs text-[#8E9B94] font-bold block">Tổng tiền</span>
                            <span className="text-emerald-700 font-extrabold text-base">{order.total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border-2 border-dashed border-[#EDE7D9] rounded-2xl text-[#8E9B94]">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-[#C6C0B0]" />
                    <p className="text-sm font-semibold">Bạn chưa có đơn hàng nào.</p>
                    <Link 
                      href="/" 
                      className="mt-4 inline-flex items-center justify-center gap-1 text-xs font-bold text-[#1B4D3E] hover:underline"
                    >
                      Bắt đầu mua sắm ngay →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </main>

    </div>
  )
}
