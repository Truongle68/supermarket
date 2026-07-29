'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/lib/store/useAuthStore"
import { authService } from "@/lib/services/auth.service"
import { setTokens } from "@/lib/utils/tokenManager"
import { ArrowLeft, Loader2, Lock, UserCog, User } from "lucide-react"
import userService from "@/lib/services/user.service"
import { UserRole } from "@/lib/types"
import getVietnameseErrorMessage from "@/lib/utils/errorMapper"
import { toast } from "sonner"

export default function PortalLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Private portal authentication endpoint
  const portalLoginMutation = useMutation({
    mutationFn: async () => {
      if (identifier.trim().length < 3) {
        throw new Error("Tên đăng nhập, email hoặc SĐT không hợp lệ")
      }
      if (password.length < 8) {
        throw new Error("Mật khẩu phải chứa ít nhất 8 ký tự")
      }

      const loginData = await authService.portalLogin({ identifier, password });
      const { access_token, refresh_token } = loginData.data;

      // Save tokens in tokenManager so subsequent calls can use it!
      setTokens(access_token, refresh_token);

      const profileData = await userService.getProfile();
      const profile = profileData.data;
      console.log("profile: ", profile)

      const rawRole = (profile.role || 'admin').toLowerCase()
      const normalizedRole: UserRole = (rawRole === 'staff' ? 'staff' : 'admin') as UserRole

      return {
        user: {
          email: profile.email || `${profile.username}@example.com`,
          name: profile.full_name || profile.username,
          username: profile.username,
          phone: profile.phone,
          role: normalizedRole
        },
        accessToken: access_token,
        refreshToken: refresh_token
      }
    },
    onSuccess: (data) => {
      toast.success("Đăng nhập portal thành công!")
      login(data.user, data.accessToken, data.refreshToken)
      const role = data.user.role?.toLowerCase()
      if (role === "staff") {
        router.push("/staff")
      } else {
        router.push("/admin")
      }
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra thông tin portal.")
      toast.error(msg)
      setErrorMsg(msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    portalLoginMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-blue-900 selection:text-blue-100">
      
      {/* Grid decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về trang chủ</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center select-none">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
            <UserCog className="w-6 h-6 text-[#1DA1F2]" />
            <span className="text-xl font-extrabold tracking-tight text-[#1DA1F2]">Tươi. Portal</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
          Cổng Đăng Nhập Nội Bộ
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-semibold">
          Dành riêng cho Quản trị viên và Nhân viên vận hành
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-[1.3rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>

            <div>
              <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Tài khoản nội bộ (Username/Email/SĐT)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-800 bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all text-slate-100"
                  placeholder="admin, email hoặc SĐT"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Mật khẩu portal
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-800 bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all text-slate-100"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={portalLoginMutation.isPending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {portalLoginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang kết nối cổng portal...
                  </>
                ) : (
                  "Xác thực Portal"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
