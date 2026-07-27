'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/lib/store/useAuthStore"
import { authService } from "@/lib/services/auth.service"
import { setTokens } from "@/lib/utils/tokenManager"
import { ArrowLeft, Loader2, Lock, User } from "lucide-react"
import userService from "@/lib/services/user.service"
import { UserRole } from "@/lib/types"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Authentication endpoint
  const loginMutation = useMutation({
    mutationFn: async () => {
      if (identifier.trim().length < 3) {
        throw new Error("Tên đăng nhập, email hoặc SĐT không hợp lệ")
      }
      if (password.length < 8) {
        throw new Error("Mật khẩu phải chứa ít nhất 8 ký tự")
      }

      const loginData = await authService.login({ identifier, password });
      const { access_token, refresh_token } = loginData.data;

      // Save tokens in tokenManager so subsequent calls can use it!
      setTokens(access_token, refresh_token);

      const profileData = await userService.getProfile();
      const profile = profileData.data;

      const rawRole = (profile.role || 'user').toLowerCase()
      const normalizedRole: UserRole = (rawRole === 'admin' ? 'admin' : rawRole === 'staff' ? 'staff' : 'user') as UserRole

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
      login(data.user, data.accessToken, data.refreshToken)
      const role = data.user.role?.toLowerCase()
      if (role === 'admin') {
        router.push("/admin")
      } else if (role === 'staff') {
        router.push("/staff")
      } else {
        router.push("/")
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    loginMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#E8E2D2_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[#64716A] hover:text-[#16422F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về trang chủ</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center select-none">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-[#16422F]">Tươi</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-3"></span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#16422F]">
          Đăng nhập vào tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-[#64716A] font-semibold">
          Hoặc{" "}
          <Link href="/register" className="font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors">
            đăng ký tài khoản mới miễn phí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-bold text-[#1E2522]">
                Tài khoản (Tên đăng nhập, Email hoặc SĐT)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium transition-all"
                  placeholder="Nhập tên đăng nhập, email hoặc SĐT"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#1E2522]">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-[#64716A]">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-xs font-bold">
                <Link href="/forgot-password" className="text-emerald-700 hover:text-emerald-800">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
