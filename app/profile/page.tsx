'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store/useAuthStore"
import { userService } from "@/lib/services/user.service"
import getVietnameseErrorMessage from "@/lib/utils/errorMapper"
import { toast } from "sonner"
import locationService from "@/lib/services/location.service"
import { Address, AddressLabel } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  ShoppingBag, 
  Phone, 
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  Save,
  LogOut,
  ShieldAlert,
  X,
  Plus,
  Trash2,
  Edit,
  Home,
  Briefcase,
  Star
} from "lucide-react"

export interface OrderHistory {
  id: string
  date: string
  status: string
  total: string
  items: string
}

// Fetch user order history (empty state)
const fetchOrders = async (): Promise<OrderHistory[]> => {
  return []
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
  const [gender, setGender] = useState("")
  const [dob, setDob] = useState("")

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Change Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailModalError, setEmailModalError] = useState("")
  const [emailModalSuccess, setEmailModalSuccess] = useState("")

  // Change Phone Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1)
  const [phoneOtpCode, setPhoneOtpCode] = useState("")
  const [phoneModalError, setPhoneModalError] = useState("")
  const [phoneModalSuccess, setPhoneModalSuccess] = useState("")
  const [phoneModalLoading, setPhoneModalLoading] = useState(false)

  // Cooldown timers (60s)
  const [phoneCooldown, setPhoneCooldown] = useState(0)
  const [emailCooldown, setEmailCooldown] = useState(0)

  useEffect(() => {
    if (phoneCooldown > 0) {
      const timer = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [phoneCooldown])

  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [emailCooldown])

  // Address Services Integration
  const { data: addressListRes, isLoading: addressLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const res = await userService.getAddressList()
      return res.data || []
    },
    enabled: !!user,
  })

  const addresses: Address[] = addressListRes || []

  // Address Form Modal State
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addrLabel, setAddrLabel] = useState<AddressLabel>("home")
  const [addrLine, setAddrLine] = useState("")
  const [addrWard, setAddrWard] = useState("")
  const [addrDistrict, setAddrDistrict] = useState("")
  const [addrCity, setAddrCity] = useState("")
  const [addrFormError, setAddrFormError] = useState("")

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null)
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null)

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: locationService.getProvinces,
    staleTime: 1000 * 60 * 60,
  })

  const { data: districts = [], isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts", selectedProvinceCode],
    queryFn: () => locationService.getDistricts(selectedProvinceCode!),
    enabled: !!selectedProvinceCode,
  })

  const { data: wards = [], isLoading: isWardsLoading } = useQuery({
    queryKey: ["wards", selectedDistrictCode],
    queryFn: () => locationService.getWards(selectedDistrictCode!),
    enabled: !!selectedDistrictCode,
  })

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value)
    const p = provinces.find((item) => item.code === code)
    setSelectedProvinceCode(code || null)
    setAddrCity(p ? p.name : "")
    setSelectedDistrictCode(null)
    setAddrDistrict("")
    setAddrWard("")
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value)
    const d = districts.find((item) => item.code === code)
    setSelectedDistrictCode(code || null)
    setAddrDistrict(d ? d.name : "")
    setAddrWard("")
  }

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value)
    const w = wards.find((item) => item.code === code)
    setAddrWard(w ? w.name : "")
  }

  const handleOpenNewAddress = () => {
    setEditingAddress(null)
    setAddrLabel("home")
    setAddrLine("")
    setAddrWard("")
    setAddrDistrict("")
    setAddrCity("")
    setSelectedProvinceCode(null)
    setSelectedDistrictCode(null)
    setAddrFormError("")
    setShowAddressModal(true)
  }

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr)
    setAddrLabel(addr.label || "home")
    setAddrLine(addr.address_line || "")
    setAddrWard(addr.ward || "")
    setAddrDistrict(addr.district || "")
    setAddrCity(addr.city || "")

    const foundProv = provinces.find((p) => p.name === addr.city)
    setSelectedProvinceCode(foundProv ? foundProv.code : null)
    setSelectedDistrictCode(null)

    setAddrFormError("")
    setShowAddressModal(true)
  }

  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      if (editingAddress) {
        return userService.updateAddress(editingAddress.id, {
          label: addrLabel,
          address_line: addrLine,
          ward: addrWard,
          district: addrDistrict,
          city: addrCity,
        })
      } else {
        return userService.createAddress({
          label: addrLabel,
          address_line: addrLine,
          ward: addrWard,
          district: addrDistrict,
          city: addrCity,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] })
      setShowAddressModal(false)
      const msg = editingAddress ? "Đã cập nhật địa chỉ thành công!" : "Đã thêm địa chỉ mới thành công!"
      toast.success(msg)
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Có lỗi xảy ra khi lưu địa chỉ.")
      toast.error(msg)
      setAddrFormError(msg)
    },
  })

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => userService.setDefaultAddress(id),
    onSuccess: () => {
      toast.success("Đã đặt địa chỉ mặc định thành công!")
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] })
    },
    onError: (err: any) => {
      toast.error(getVietnameseErrorMessage(err, "Không thể đặt địa chỉ mặc định."))
    }
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => userService.deleteAddress(id),
    onSuccess: () => {
      toast.success("Đã xóa địa chỉ thành công!")
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] })
    },
    onError: (err: any) => {
      toast.error(getVietnameseErrorMessage(err, "Không thể xóa địa chỉ."))
    }
  })

  // Change Phone Workflow Functions
  const handleSendPhoneOTP = async () => {
    setPhoneModalError("")
    setPhoneModalSuccess("")
    setPhoneModalLoading(true)
    try {
      await userService.verifyPhone()
      setPhoneCooldown(60)
      toast.success("Mã OTP xác thực đã được gửi tới số điện thoại của bạn!")
      setPhoneModalSuccess(`Mã OTP xác thực đã được gửi tới số điện thoại ${phone.trim()}.`)
      setPhoneStep(2)
    } catch (err: any) {
      const msg = getVietnameseErrorMessage(err, "Có lỗi xảy ra khi gửi mã OTP.")
      toast.error(msg)
      setPhoneModalError(msg)
    } finally {
      setPhoneModalLoading(false)
    }
  }

  useEffect(() => {
    if (showPhoneModal) {
      router.prefetch("/profile/change-phone")
    }
  }, [showPhoneModal, router])

  const handleVerifyPhoneOTP = async () => {
    if (phoneOtpCode.length !== 6) {
      setPhoneModalError("Mã OTP phải gồm 6 chữ số")
      return
    }
    setPhoneModalError("")
    setPhoneModalSuccess("")
    setPhoneModalLoading(true)
    try {
      const { data } = await userService.verifyPhoneConfirm(phoneOtpCode.trim())
      if (data?.change_phone_token) {
        toast.success("Xác thực OTP thành công!")
        setPhoneModalSuccess("Xác thực thành công! Đang chuyển hướng...")
        setPhoneModalLoading(true)
        
        setTimeout(() => {
          router.push(`/profile/change-phone?token=${encodeURIComponent(data.change_phone_token)}`)
        }, 1000)
      } else {
        setPhoneModalLoading(false)
      }
    } catch (err: any) {
      const msg = getVietnameseErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn.")
      toast.error(msg)
      setPhoneModalError(msg)
      setPhoneModalLoading(false)
    }
  }

  // Fetch real profile data from backend
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", user?.username],
    queryFn: async () => {
      if (!accessToken) return null
      const data = await userService.getProfile()
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
      setGender(profile.gender || "")
      setDob(profile.dob || "")
      const localAddress = localStorage.getItem(`address_${profile.username}`) || ""
      setAddress(localAddress)
    }
  }, [profile])

  // Fetch orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["ordersHistory"],
    queryFn: fetchOrders,
    enabled: !!user,
  })

  // Update profile mutation calling user-service POST /users/update-profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: { email?: string; name: string; gender: string; dob: string; address: string }) => {
      const data = await userService.updateProfile({
        email: updatedData.email,
        full_name: updatedData.name,
        gender: updatedData.gender as any,
        dob: updatedData.dob
      })

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
      toast.success("Cập nhật thông tin hồ sơ thành công!")
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Có lỗi xảy ra khi cập nhật hồ sơ.")
      toast.error(msg)
    }
  })

  // Request verification email mutation
  const requestVerifyEmailMutation = useMutation({
    mutationFn: async () => {
      const data = await userService.requestEmailLink(email)
      return data
    },
    onSuccess: () => {
      toast.success(`Liên kết xác thực đã được gửi tới email ${profile?.email || email}. Vui lòng kiểm tra hộp thư!`)
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Không thể gửi email xác thực. Vui lòng thử lại sau.")
      toast.error(msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({ email, name, gender, dob, address })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    
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
    
    toast.success("Đổi mật khẩu thành công!")
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
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-[#1E2522]">Địa chỉ Email</label>
                            {profile?.email ? (
                              profile?.is_email_verified ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                                  Đã xác thực
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                                  Chưa xác thực
                                </span>
                              )
                            ) : null}
                          </div>
                          {profile?.is_email_verified ? (
                            <button
                              type="button"
                              onClick={() => {
                                setShowEmailModal(true)
                                setEmailModalError("")
                                setEmailModalSuccess("")
                              }}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-all hover:underline"
                            >
                              Thay đổi
                            </button>
                          ) : profile?.email ? (
                            <button
                              type="button"
                              disabled={requestVerifyEmailMutation.isPending}
                              onClick={() => requestVerifyEmailMutation.mutate()}
                              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-all underline cursor-pointer disabled:opacity-50"
                            >
                              {requestVerifyEmailMutation.isPending ? "Đang gửi..." : "Xác thực"}
                            </button>
                          ) : null}
                        </div>
                        <input
                          type="email"
                          disabled={!!profile?.is_email_verified}
                          readOnly={!!profile?.is_email_verified}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`block w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            profile?.is_email_verified
                              ? "bg-[#FAF8F2] border border-[#E5DFCE] text-[#8E9B94] cursor-not-allowed focus:outline-none"
                              : "bg-[#FDFBF7] border border-[#C6C0B0] text-[#1E2522] focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                          }`}
                          placeholder="Nhập địa chỉ email của bạn"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1E2522]">Giới tính</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522] cursor-pointer"
                        >
                          <option value="">Chưa chọn</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1E2522]">Ngày sinh</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-[#1E2522]">Số điện thoại</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhoneModal(true)
                            setPhoneStep(1)
                            setPhoneModalError("")
                            setPhoneModalSuccess("")
                          }}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-all hover:underline"
                        >
                          Thay đổi
                        </button>
                      </div>
                      <div className="mt-1 relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-[#8E9B94]" />
                        <input
                          type="text"
                          disabled
                          readOnly
                          value={phone || "Chưa cập nhật số điện thoại"}
                          className="block w-full pl-9 pr-3 py-2.5 bg-[#FAF8F2] border border-[#E5DFCE] rounded-xl text-xs font-semibold text-[#8E9B94] cursor-not-allowed focus:outline-none"
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
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-[#F3EFE6]">
                  <div>
                    <h3 className="text-xl font-bold text-[#16422F]">Địa chỉ giao hàng</h3>
                    <p className="text-xs text-[#64716A] font-semibold mt-1">Quản lý các địa chỉ nhận hàng của bạn</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewAddress}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#1B4D3E] hover:bg-[#12362C] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm địa chỉ mới
                  </button>
                </div>

                {addressLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
                    <p className="text-xs text-[#64716A] font-semibold mt-2">Đang tải danh sách địa chỉ...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 bg-[#FAF8F2] border border-dashed border-[#E5DFCE] rounded-2xl p-6">
                    <MapPin className="w-12 h-12 text-[#8E9B94] mx-auto mb-3 opacity-60" />
                    <h4 className="font-bold text-[#16422F] text-sm">Chưa có địa chỉ giao hàng</h4>
                    <p className="text-xs text-[#64716A] mt-1 max-w-xs mx-auto">Bạn chưa thêm địa chỉ nào. Thêm địa chỉ mới để đặt hàng nhanh chóng hơn.</p>
                    <button
                      type="button"
                      onClick={handleOpenNewAddress}
                      className="mt-4 inline-flex items-center gap-1.5 py-2 px-4 bg-[#1B4D3E] hover:bg-[#12362C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm địa chỉ đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          item.is_default
                            ? "border-emerald-600/40 bg-emerald-50/20 shadow-sm"
                            : "border-[#EBE6DA] bg-white hover:border-[#C6C0B0]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.label === "work"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}
                              >
                                {item.label === "work" ? (
                                  <>
                                    <Briefcase className="w-3 h-3" /> Văn phòng
                                  </>
                                ) : (
                                  <>
                                    <Home className="w-3 h-3" /> Nhà riêng
                                  </>
                                )}
                              </span>

                              {item.is_default && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Mặc định
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-[#1E2522] mt-1 flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                              <span>
                                {item.address_line}
                                {[item.ward, item.district, item.city].filter(Boolean).length > 0 &&
                                  `, ${[item.ward, item.district, item.city].filter(Boolean).join(", ")}`}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3EFE6] shrink-0">
                            {!item.is_default && (
                              <button
                                type="button"
                                disabled={setDefaultAddressMutation.isPending}
                                onClick={() => setDefaultAddressMutation.mutate(item.id)}
                                className="py-1.5 px-3 border border-[#C6C0B0] hover:bg-neutral-100 rounded-xl text-[11px] font-bold transition-all text-[#5D6B63] cursor-pointer disabled:opacity-50"
                              >
                                Thiết lập mặc định
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(item)}
                              className="p-1.5 border border-[#C6C0B0] hover:bg-neutral-100 rounded-xl text-[#5D6B63] transition-all cursor-pointer"
                              title="Chỉnh sửa địa chỉ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={deleteAddressMutation.isPending}
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
                                  deleteAddressMutation.mutate(item.id)
                                }
                              }}
                              className="p-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                              title="Xóa địa chỉ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Tab PASSWORD */}
            {activeTab === "password" && (
              <div className="bg-white border border-[#EBE6DA] rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[#16422F] mb-6 flex items-center gap-2 pb-4 border-b border-[#F3EFE6]">
                  Đổi mật khẩu
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
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

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-[#1C201E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE6DA] max-w-md w-full rounded-[2rem] p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowEmailModal(false)
                setEmailModalError("")
                setEmailModalSuccess("")
              }}
              className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full border border-[#EBE6DA] bg-white hover:bg-neutral-50 text-[#64716A] hover:text-[#16422F] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-[#16422F] tracking-tight">Thay đổi địa chỉ Email</h3>
              <p className="text-xs text-[#64716A] mt-1 font-semibold">Gửi liên kết xác thực tới email hiện tại để bắt đầu đổi email</p>
            </div>

            {emailModalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold">
                {emailModalError}
              </div>
            )}

            {emailModalSuccess && (
              <div className="space-y-4 mb-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
                  {emailModalSuccess}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold px-1">
                  <span className="text-[#64716A]">Chưa nhận được email?</span>
                  {emailCooldown > 0 ? (
                    <span className="text-[#8E9B94]">Gửi lại sau {emailCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setEmailModalError("")
                        setEmailModalSuccess("")
                        try {
                          await userService.requestChangeEmail(email)
                          setEmailCooldown(60)
                          setEmailModalSuccess("Liên kết xác thực đã được gửi lại tới email của bạn!")
                        } catch (err: any) {
                          setEmailModalError(getVietnameseErrorMessage(err, "Không thể gửi lại email xác thực."))
                        }
                      }}
                      className="text-emerald-700 font-extrabold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Gửi lại email
                    </button>
                  )}
                </div>
              </div>
            )}

            {!emailModalSuccess && (
              <div className="space-y-4">
                <p className="text-xs text-[#5D6B63] font-semibold leading-relaxed">
                  Nhấn nút bên dưới để nhận liên kết xác thực gửi đến email hiện tại của bạn (<strong className="text-[#1E2522]">{profile?.email}</strong>):
                </p>
                <button
                  onClick={async () => {
                    setEmailModalError("")
                    setEmailModalSuccess("")
                    try {
                      await userService.requestChangeEmail(email)
                      setEmailCooldown(60)
                      setEmailModalSuccess("Liên kết xác thực đã được gửi tới email của bạn! Vui lòng kiểm tra hộp thư.")
                    } catch (err: any) {
                      setEmailModalError(getVietnameseErrorMessage(err, "Không thể gửi email xác thực."))
                    }
                  }}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Gửi liên kết xác thực qua Email
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-[#1C201E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE6DA] max-w-md w-full rounded-[2rem] p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowPhoneModal(false)
                setPhoneStep(1)
                setPhoneOtpCode("")
                setPhoneModalError("")
                setPhoneModalSuccess("")
              }}
              className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full border border-[#EBE6DA] bg-white hover:bg-neutral-50 text-[#64716A] hover:text-[#16422F] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {phoneStep === 1 ? (
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-[#16422F] tracking-tight">Xác thực tài khoản</h3>
                <p className="text-xs text-[#64716A] mt-1 font-semibold">Để tăng cường bảo mật cho tài khoản của bạn, hãy xác minh thông tin bằng một trong những cách sau</p>
              </div>
            ): (
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-[#16422F] tracking-tight">Thay đổi Số điện thoại</h3>
                <p className="text-xs text-[#64716A] mt-1 font-semibold">Nhận mã OTP để xác thực số điện thoại mới</p>
              </div>
            )}


            {phoneModalSuccess && phoneModalLoading ? (
              <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-center">
                  <Loader2 className="w-10 h-10 text-[#1B4D3E] animate-spin" />
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
                  {phoneModalSuccess}
                </div>
              </div>
            ) : (
              <>
                {phoneModalError && (
                  <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold">
                    {phoneModalError}
                  </div>
                )}

                {phoneModalSuccess && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
                    {phoneModalSuccess}
                  </div>
                )}

                {phoneStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#5D6B63] font-semibold leading-relaxed">
                      Xác minh bằng mã OTP gửi qua SMS:
                    </p>
                    <button
                      onClick={handleSendPhoneOTP}
                      disabled={phoneModalLoading}
                      className="w-full flex justify-center items-center py-2.5 px-4 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs transition-color duration-300 ease-in-out cursor-pointer"
                    >
                      {phoneModalLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Đang gửi mã...
                        </>
                      ) : (
                        "Gửi mã OTP xác thực"
                      )}
                    </button>
                  </div>
                )}

                {phoneStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#5D6B63] font-semibold leading-relaxed">
                      Nhập mã OTP gồm 6 chữ số
                    </p>
                    <div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={phoneOtpCode}
                        onChange={(e) => setPhoneOtpCode(e.target.value)}
                        className="block w-full text-center tracking-[0.5em] text-lg font-bold px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                        placeholder="••••••"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold px-1">
                      <span className="text-[#64716A]">Chưa nhận được mã OTP?</span>
                      {phoneCooldown > 0 ? (
                        <span className="text-[#8E9B94]">Gửi lại sau {phoneCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOTP}
                          disabled={phoneModalLoading}
                          className="text-emerald-700 font-extrabold hover:underline cursor-pointer disabled:opacity-50"
                        >
                          Gửi lại mã OTP
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setPhoneStep(1)
                          setPhoneModalError("")
                          setPhoneModalSuccess("")
                        }}
                        disabled={phoneModalLoading}
                        className="flex-1 py-2.5 px-4 border border-[#C6C0B0] hover:bg-neutral-50 text-[#5D6B63] font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Quay lại
                      </button>
                      <button
                        onClick={handleVerifyPhoneOTP}
                        disabled={phoneModalLoading || phoneOtpCode.length !== 6}
                        className="flex-1 flex justify-center items-center gap-1.5 py-2.5 px-4 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {phoneModalLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          "Xác nhận"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#EBE6DA] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#16422F] mb-1">
              {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng mới"}
            </h3>
            <p className="text-xs text-[#64716A] font-semibold mb-6">
              Điền thông tin địa chỉ chi tiết để đảm bảo đơn hàng giao chính xác.
            </p>

            {addrFormError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                {addrFormError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveAddressMutation.mutate()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#1E2522] mb-1">Loại địa chỉ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAddrLabel("home")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      addrLabel === "home"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20"
                        : "border-[#C6C0B0] bg-[#FDFBF7] text-[#5D6B63] hover:bg-neutral-100"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Nhà riêng
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddrLabel("work")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      addrLabel === "work"
                        ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20"
                        : "border-[#C6C0B0] bg-[#FDFBF7] text-[#5D6B63] hover:bg-neutral-100"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Văn phòng
                  </button>
                </div>
              </div>

              {/* Province / City select */}
              <div>
                <label className="block text-xs font-bold text-[#1E2522]">Tỉnh / Thành phố</label>
                <select
                  required
                  value={selectedProvinceCode || ""}
                  onChange={handleProvinceChange}
                  className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522] cursor-pointer"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District & Ward select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E2522]">Quận / Huyện</label>
                  <select
                    disabled={!selectedProvinceCode || isDistrictsLoading}
                    value={selectedDistrictCode || ""}
                    onChange={handleDistrictChange}
                    className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isDistrictsLoading ? "Đang tải..." : "-- Chọn Quận / Huyện --"}
                    </option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E2522]">Phường / Xã</label>
                  <select
                    disabled={!selectedDistrictCode || isWardsLoading}
                    value={wards.find((w) => w.name === addrWard)?.code || ""}
                    onChange={handleWardChange}
                    className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isWardsLoading ? "Đang tải..." : "-- Chọn Phường / Xã --"}
                    </option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-xs font-bold text-[#1E2522]">Địa chỉ chi tiết (Số nhà, Tên đường)</label>
                <input
                  type="text"
                  required
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-[#1E2522]"
                  placeholder="Ví dụ: 123 Nguyễn Huệ"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#F3EFE6]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="py-2.5 px-5 border border-[#C6C0B0] hover:bg-neutral-100 text-[#5D6B63] font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveAddressMutation.isPending}
                  className="py-2.5 px-6 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {saveAddressMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingAddress ? "Lưu thay đổi" : "Tạo địa chỉ mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
